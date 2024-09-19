/**
 * DO NOT PUT THIS TEST CASE FROM VITEST TO NODE.JS TEST RUNNER
 *
 * msw has side effect that will replace the global fetch function,
 *  which will cause the test runner to hang indefinitely for some reason.
 *  but vitest will start new process for each test case, so it's safe to use msw in vitest,
 *  in the meanwhile, node.js test runner only run in single process.
 */
import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";

const jobsHashMap = new Map<string, boolean>();

const handlers = [
  http.post("https://api.cloud.llamaindex.ai/api/v1/parsing/upload", () => {
    return HttpResponse.json({
      id: crypto.randomUUID(),
    });
  }),
  http.get(
    "https://api.cloud.llamaindex.ai/api/v1/parsing/job/:id",
    ({ params }): HttpResponse => {
      const jobId = params.id as string;
      if (jobsHashMap.has(jobId)) {
        return HttpResponse.json({
          id: jobId,
          status: "SUCCESS",
        });
      } else {
        jobsHashMap.set(jobId, true);
      }
      return HttpResponse.json({
        id: jobId,
        status: "PENDING",
      });
    },
  ),
  http.get(
    "https://api.cloud.llamaindex.ai/api/v1/parsing/job/:id/result/markdown",
    () => {
      const job_metadata = {
        credits_used: faker.number.int({ min: 1, max: 10 }),
        credits_max: 1000,
        job_credits_usage: faker.number.int({ min: 1, max: 10 }),
        job_pages: faker.number.int({ min: 0, max: 5 }),
        job_is_cache_hit: faker.datatype.boolean(),
      };
      return HttpResponse.json({
        markdown: faker.lorem.paragraphs({
          min: 3,
          max: 1000,
        }),
        job_metadata,
      });
    },
  ),
  http.get(
    "https://api.cloud.llamaindex.ai/api/v1/parsing/job/:id/result/text",
    () => {
      const job_metadata = {
        credits_used: faker.number.int({ min: 1, max: 10 }),
        credits_max: 1000,
        job_credits_usage: faker.number.int({ min: 1, max: 10 }),
        job_pages: faker.number.int({ min: 0, max: 5 }),
        job_is_cache_hit: faker.datatype.boolean(),
      };
      return HttpResponse.json({
        text: faker.lorem.paragraphs({
          min: 3,
          max: 1000,
        }),
        job_metadata,
      });
    },
  ),
  http.get(
    "https://api.cloud.llamaindex.ai/api/v1/parsing/job/:id/result/json",
    () => {
      const pages = Array.from({ length: 1 }, () => ({
        page: 1,
        text: faker.lorem.paragraphs(2),
        md: `# ${faker.lorem.sentence()}\n\n${faker.lorem.paragraph()}`,
        images: [
          {
            name: faker.system.fileName(),
            height: faker.number.int({ min: 100, max: 500 }),
            width: faker.number.int({ min: 600, max: 1600 }),
            x: faker.number.int({ min: 0, max: 50 }),
            y: faker.number.int({ min: 0, max: 50 }),
            original_width: faker.number.int({ min: 1800, max: 2000 }),
            original_height: faker.number.int({ min: 400, max: 600 }),
          },
        ],
        items: [
          {
            type: "heading",
            lvl: 1,
            value: faker.lorem.sentence(),
            md: `# ${faker.lorem.sentence()}`,
            bBox: {
              x: faker.number.float({ min: 20, max: 40 }),
              y: faker.number.float({ min: 20, max: 30 }),
              w: faker.number.float({ min: 300, max: 400 }),
              h: faker.number.float({ min: 30, max: 50 }),
            },
          },
          {
            type: "table",
            rows: [
              [faker.lorem.word(), faker.lorem.sentence()],
              [faker.lorem.word(), faker.lorem.sentence()],
              [faker.lorem.word(), faker.lorem.sentence()],
              [faker.lorem.word(), faker.lorem.sentence()],
            ],
            md: faker.lorem.sentences(4),
            isPerfectTable: faker.datatype.boolean(),
            csv: faker.lorem.sentences(4),
          },
          {
            type: "text",
            value: faker.lorem.paragraphs(2),
            md: faker.lorem.paragraphs(2),
            bBox: {
              x: faker.number.float({ min: 5, max: 10 }),
              y: faker.number.float({ min: 20, max: 30 }),
              w: faker.number.float({ min: 800, max: 900 }),
              h: faker.number.float({ min: 30, max: 50 }),
            },
          },
        ],
      }));

      const response = {
        pages,
        job_metadata: {
          credits_used: faker.number.int({ min: 1, max: 10 }),
          credits_max: 1000,
          job_credits_usage: faker.number.int({ min: 1, max: 10 }),
          job_pages: faker.number.int({ min: 0, max: 5 }),
          job_is_cache_hit: faker.datatype.boolean(),
        },
      };
      return HttpResponse.json(response);
    },
  ),
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

test("llama parse should return a successful document", async () => {
  const { LlamaParseReader } = await import("@llamaindex/cloud/reader");
  const reader = new LlamaParseReader({
    verbose: false,
    apiKey: "llx-fake-api-key",
  });
  const fileUrl = new URL("../../e2e/fixtures/pdf/TOS.pdf", import.meta.url);
  const documents = await reader.loadData(fileURLToPath(fileUrl));
  expect(documents.length).toBe(1);
});
