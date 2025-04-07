import { createClient, createConfig } from "@hey-api/client-fetch";
import { fs, getEnv, path } from "@llamaindex/env";
import {
  createWorkflow,
  getContext,
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
  z.object({
    input: z
      .string()
      .or(z.instanceof(File))
      .or(z.instanceof(Blob))
      .or(z.instanceof(Uint8Array))
      .describe("input"),
    form: parseFormSchema.optional(),
  }),
);

const checkStatusEvent = workflowEvent<string>();
const checkStatusSuccessEvent = workflowEvent<string>();
const requestMarkdownEvent = workflowEvent<string>();
const requestTextEvent = workflowEvent<string>();
const markdownResultEvent = workflowEvent<string>();
const textResultEvent = workflowEvent<string>();

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

llamaParseWorkflow.handle([startEvent], async ({ data: { input, form } }) => {
  const { sendEvent } = getContext();
  const store = llamaParseWorkflow.getStore();
  const isFilePath = typeof input === "string";
  const data = isFilePath ? await fs.readFile(input) : input;
  const filename = isFilePath ? path.basename(input) : undefined;
  const file: File | Blob =
    globalThis.File && filename ? new File([data], filename) : new Blob([data]);
  const {
    data: { id, status },
  } = await uploadFileApiV1ParsingUploadPost({
    throwOnError: true,
    body: {
      ...form,
      file,
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

const cacheMap = new Map<
  string,
  ReturnType<typeof llamaParseWorkflow.createContext>
>();

export const read = async (
  params: InferWorkflowEventData<typeof startEvent> & LlamaParseWorkflowParams,
): Promise<string> => {
  const key = hash({ apiKey: params.apiKey, region: params.region });
  if (!cacheMap.has(key)) {
    const context = llamaParseWorkflow.createContext(params);
    cacheMap.set(key, context);
  }
  const { stream, sendEvent, createFilter } = cacheMap.get(key)!;
  const ev = startEvent.with(params);
  sendEvent(ev);
  const ev1 = await collect(
    until(
      stream,
      createFilter(ev, (ev) => checkStatusSuccessEvent.include(ev)),
    ),
  );
  const requestEv = requestMarkdownEvent.with(ev1.at(-1)!.data);
  sendEvent(requestEv);
  const ev2 = await collect(
    until(
      stream,
      createFilter(requestEv, (ev) => markdownResultEvent.include(ev)),
    ),
  );
  return ev2.at(-1)!.data;
};
