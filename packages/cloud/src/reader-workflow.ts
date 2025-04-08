import { createClient, createConfig } from "@hey-api/client-fetch";
import { fs, getEnv, path } from "@llamaindex/env";
import {
  createWorkflow,
  type WorkflowEvent,
  workflowEvent,
  type WorkflowEventData,
} from "fluere";
import { withStore } from "fluere/middleware/store";
import { withTraceEvents } from "fluere/middleware/trace-events";
import { collect } from "fluere/stream/consumer";
import { until } from "fluere/stream/until";
import { pRetryHandler } from "fluere/util/p-retry";
import { zodEvent } from "fluere/util/zod";
import hash from "stable-hash";
import { z } from "zod";
import {
  type Body_upload_file_api_v1_parsing_upload_post,
  getJobApiV1ParsingJobJobIdGet,
  getJobJsonResultApiV1ParsingJobJobIdResultJsonGet,
  getJobResultApiV1ParsingJobJobIdResultMarkdownGet,
  getJobTextResultApiV1ParsingJobJobIdResultTextGet,
  type StatusEnum,
  uploadFileApiV1ParsingUploadPost,
} from "./api";
import { parseFormSchema } from "./schema";

type InferWorkflowEventData<T> =
  T extends WorkflowEventData<infer U>
    ? U
    : T extends WorkflowEvent<infer U>
      ? U
      : never;

const startEvent = zodEvent(
  z.union([
    parseFormSchema.merge(
      z.object({
        file: z
          .string()
          .or(z.instanceof(File))
          .or(z.instanceof(Blob))
          .or(z.instanceof(Uint8Array))
          .optional()
          .describe("input"),
      }),
    ),
    parseFormSchema.merge(
      z.object({
        input_s3_path: z.string().optional(),
      }),
    ),
    parseFormSchema.merge(
      z.object({
        input_url: z.string().optional(),
      }),
    ),
  ]),
);

const checkStatusEvent = workflowEvent<string>();
const checkStatusSuccessEvent = workflowEvent<string>();
const requestMarkdownEvent = workflowEvent<string>();
const requestTextEvent = workflowEvent<string>();
const requestJsonEvent = workflowEvent<string>();

const markdownResultEvent = workflowEvent<string>();
const textResultEvent = workflowEvent<string>();
const jsonResultEvent = workflowEvent<unknown>();

export type LlamaParseWorkflowParams = {
  region?: "us" | "eu" | "us-staging";
  apiKey?: string;
};

const URLS = {
  us: "https://api.cloud.llamaindex.ai",
  eu: "https://api.cloud.eu.llamaindex.ai",
  "us-staging": "https://api.staging.llamaindex.ai",
} as const;

const llamaParseWorkflow = withStore((params: LlamaParseWorkflowParams) => {
  const apiKey = params.apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");
  const region = params.region ?? "us";
  if (!apiKey) {
    throw new Error("LLAMA_CLOUD_API_KEY is not set");
  }
  return {
    cache: {} as Record<string, StatusEnum>,
    client: createClient(
      createConfig({
        baseUrl: URLS[region],
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
    ),
  };
}, withTraceEvents(createWorkflow()));

llamaParseWorkflow.handle([startEvent], async ({ data: form }) => {
  const store = llamaParseWorkflow.getStore();
  const finalForm = { ...form } as Body_upload_file_api_v1_parsing_upload_post;
  if ("file" in form) {
    // support loads from the file system
    const file = form?.file;
    const isFilePath = typeof file === "string";
    const data = isFilePath ? await fs.readFile(file) : file;
    const filename: string | undefined = isFilePath
      ? path.basename(file)
      : undefined;
    finalForm.file = data
      ? globalThis.File && filename
        ? new File([data], filename)
        : new Blob([data])
      : null;
  }
  const {
    data: { id, status },
  } = await uploadFileApiV1ParsingUploadPost({
    throwOnError: true,
    body: {
      ...finalForm,
    } satisfies {
      [Key in keyof Body_upload_file_api_v1_parsing_upload_post]:
        | Body_upload_file_api_v1_parsing_upload_post[Key]
        | undefined;
    } as Body_upload_file_api_v1_parsing_upload_post,
    client: store.client,
  });
  store.cache[id] = status;
  return checkStatusEvent.with(id);
});

llamaParseWorkflow.handle(
  [checkStatusEvent],
  pRetryHandler(
    async ({ data: uuid }) => {
      const store = llamaParseWorkflow.getStore();
      if (store.cache[uuid] === "SUCCESS") {
        {
          return checkStatusSuccessEvent.with(uuid);
        }
      }
      const {
        data: { status },
      } = await getJobApiV1ParsingJobJobIdGet({
        throwOnError: true,
        path: {
          job_id: uuid,
        },
        client: store.client,
      });
      store.cache[uuid] = status;
      if (status === "SUCCESS") {
        return checkStatusSuccessEvent.with(uuid);
      }
      throw new Error(`LLamaParse status: ${status}`);
    },
    {
      retries: 100,
    },
  ),
);

llamaParseWorkflow.handle([requestMarkdownEvent], async ({ data: job_id }) => {
  const store = llamaParseWorkflow.getStore();
  const { data } = await getJobResultApiV1ParsingJobJobIdResultMarkdownGet({
    throwOnError: true,
    path: {
      job_id,
    },
    client: store.client,
  });
  return markdownResultEvent.with(data.markdown);
});

llamaParseWorkflow.handle([requestTextEvent], async ({ data: job_id }) => {
  const store = llamaParseWorkflow.getStore();
  const { data } = await getJobTextResultApiV1ParsingJobJobIdResultTextGet({
    throwOnError: true,
    path: {
      job_id,
    },
    client: store.client,
  });
  return textResultEvent.with(data.text);
});

llamaParseWorkflow.handle([requestJsonEvent], async ({ data: job_id }) => {
  const store = llamaParseWorkflow.getStore();
  const { data } = await getJobJsonResultApiV1ParsingJobJobIdResultJsonGet({
    throwOnError: true,
    path: {
      job_id,
    },
    client: store.client,
  });
  return jsonResultEvent.with(data.pages);
});

const cacheMap = new Map<
  string,
  ReturnType<typeof llamaParseWorkflow.createContext>
>();

export type ParseJob = {
  get jobId(): string;
  get signal(): AbortSignal;
  get context(): ReturnType<typeof llamaParseWorkflow.createContext>;
  get form(): InferWorkflowEventData<typeof startEvent>;

  markdown(): Promise<string>;
  text(): Promise<string>;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  json(): Promise<any[]>;
};

export const upload = async (
  params: InferWorkflowEventData<typeof startEvent> & LlamaParseWorkflowParams,
): Promise<ParseJob> => {
  //#region cache
  const key = hash({ apiKey: params.apiKey, region: params.region });
  if (!cacheMap.has(key)) {
    const context = llamaParseWorkflow.createContext(params);
    cacheMap.set(key, context);
  }
  //#endregion

  //#region upload event
  const context = cacheMap.get(key)!;
  const { stream, sendEvent, createFilter } = context;
  const ev = startEvent.with(params);
  sendEvent(ev);
  const uploadThread = await collect(
    until(
      stream,
      createFilter(ev, (ev) => checkStatusSuccessEvent.include(ev)),
    ),
  );
  //#region
  const jobId: string = uploadThread.at(-1)!.data;
  const job = {
    get signal() {
      // lazy load
      return context.signal;
    },
    get jobId() {
      return jobId;
    },
    get form() {
      return ev.data;
    },
    get context() {
      return context;
    },
    async markdown(): Promise<string> {
      const requestEv = requestMarkdownEvent.with(jobId);
      sendEvent(requestEv);
      const markdownThread = await collect(
        until(
          stream,
          createFilter(requestEv, (ev) => markdownResultEvent.include(ev)),
        ),
      );
      return markdownThread.at(-1)!.data;
    },
    async text(): Promise<string> {
      const requestEv = requestTextEvent.with(jobId);
      sendEvent(requestEv);
      const textThread = await collect(
        until(
          stream,
          createFilter(requestEv, (ev) => textResultEvent.include(ev)),
        ),
      );
      return textThread.at(-1)!.data;
    },
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    async json(): Promise<any[]> {
      const requestEv = requestJsonEvent.with(jobId);
      sendEvent(requestEv);
      const jsonThread = await collect(
        until(
          stream,
          createFilter(requestEv, (ev) => jsonResultEvent.include(ev)),
        ),
      );
      return jsonThread.at(-1)!.data;
    },
    async images(): Promise<void> {
      const json = await job.json();
      const images = json.flatMap(({ images }) => images);
      images.map((image) => {
        // todo
      });
    },
  };
  return job;
};
