import { getEnv } from "@llamaindex/env";
import type { IncomingMessage, ServerResponse } from "http";
import { LLamaCloudFileService } from "llamaindex";
import { sendJSONResponse } from "../utils/request";

export const getLlamaCloudConfig = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  if (!getEnv("LLAMA_CLOUD_API_KEY")) {
    return sendJSONResponse(res, 500, {
      error: "env variable LLAMA_CLOUD_API_KEY is required to use LlamaCloud",
    });
  }

  try {
    const config = {
      projects: await LLamaCloudFileService.getAllProjectsWithPipelines(),
      pipeline: {
        pipeline: getEnv("LLAMA_CLOUD_INDEX_NAME"),
        project: getEnv("LLAMA_CLOUD_PROJECT_NAME"),
      },
    };
    return sendJSONResponse(res, 200, config);
  } catch (error) {
    return sendJSONResponse(res, 500, {
      error: "Failed to fetch LlamaCloud configuration",
    });
  }
};
