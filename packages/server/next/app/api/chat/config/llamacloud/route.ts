import { LLamaCloudFileService } from "llamaindex";
import { NextResponse } from "next/server";

/**
 * This API is to get config from the backend envs and expose them to the frontend
 */
export async function GET() {
  if (!process.env.LLAMA_CLOUD_API_KEY) {
    return NextResponse.json(
      {
        error: "env variable LLAMA_CLOUD_API_KEY is required to use LlamaCloud",
      },
      { status: 500 },
    );
  }
  const config = {
    projects: await LLamaCloudFileService.getAllProjectsWithPipelines(),
    pipeline: {
      pipeline: process.env.LLAMA_CLOUD_INDEX_NAME,
      project: process.env.LLAMA_CLOUD_PROJECT_NAME,
    },
  };
  return NextResponse.json(config, { status: 200 });
}
