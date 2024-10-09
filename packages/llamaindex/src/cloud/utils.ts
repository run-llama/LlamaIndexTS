import { client, ProjectsService } from "@llamaindex/cloud/api";
import { DEFAULT_BASE_URL } from "@llamaindex/core/global";
import { getEnv } from "@llamaindex/env";
import type { ClientParams } from "./type.js";

function getBaseUrl(baseUrl?: string): string {
  return baseUrl ?? getEnv("LLAMA_CLOUD_BASE_URL") ?? DEFAULT_BASE_URL;
}

export function getAppBaseUrl(): string {
  return client.getConfig().baseUrl?.replace(/api\./, "") ?? "";
}

// fixme: refactor this to init at the top level or module level
let initOnce = false;
export function initService({ apiKey, baseUrl }: ClientParams = {}) {
  if (initOnce) {
    return;
  }
  initOnce = true;
  client.setConfig({
    baseUrl: getBaseUrl(baseUrl),
    throwOnError: true,
  });
  const token = apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");
  client.interceptors.request.use((request) => {
    request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  });
  if (!token) {
    throw new Error(
      "API Key is required for LlamaCloudIndex. Please pass the apiKey parameter",
    );
  }
}

export async function getProjectId(
  projectName: string,
  organizationId?: string,
): Promise<string> {
  const { data: projects } = await ProjectsService.listProjectsApiV1ProjectsGet(
    {
      query: {
        project_name: projectName,
        organization_id: organizationId ?? null,
      },
      throwOnError: true,
    },
  );

  if (projects.length === 0) {
    throw new Error(
      `Unknown project name ${projectName}. Please confirm a managed project with this name exists.`,
    );
  } else if (projects.length > 1) {
    throw new Error(
      `Multiple projects found with name ${projectName}. Please specify organization_id.`,
    );
  }

  const project = projects[0]!;

  if (!project.id) {
    throw new Error(`No project found with name ${projectName}`);
  }

  return project.id;
}
