import { OpenAPI, ProjectsService } from "@llamaindex/cloud/api";
import { getEnv } from "@llamaindex/env";
import type { ClientParams } from "./constants.js";
import { DEFAULT_BASE_URL } from "./constants.js";

function getBaseUrl(baseUrl?: string): string {
  return baseUrl ?? getEnv("LLAMA_CLOUD_BASE_URL") ?? DEFAULT_BASE_URL;
}

export function getAppBaseUrl(): string {
  return OpenAPI.BASE.replace(/api\./, "");
}

export function initService({ apiKey, baseUrl }: ClientParams = {}) {
  OpenAPI.TOKEN = apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");
  OpenAPI.BASE = getBaseUrl(baseUrl);
  if (!OpenAPI.TOKEN) {
    throw new Error(
      "API Key is required for LlamaCloudIndex. Please pass the apiKey parameter",
    );
  }
}

export async function getProjectId(
  projectName: string,
  organizationId?: string,
): Promise<string> {
  const projects = await ProjectsService.listProjectsApiV1ProjectsGet({
    projectName: projectName,
    organizationId: organizationId,
  });

  if (projects.length === 0) {
    throw new Error(
      `Unknown project name ${projectName}. Please confirm a managed project with this name exists.`,
    );
  } else if (projects.length > 1) {
    throw new Error(
      `Multiple projects found with name ${projectName}. Please specify organization_id.`,
    );
  }

  const project = projects[0];

  if (!project.id) {
    throw new Error(`No project found with name ${projectName}`);
  }

  return project.id;
}
