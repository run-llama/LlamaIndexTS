import { ServiceContext } from "../ServiceContext";

export const DEFAULT_PROJECT_NAME = "default";
export const DEFAULT_BASE_URL = "https://api.cloud.llamaindex.ai";

export type ClientParams = { apiKey?: string; baseUrl?: string };
export type CloudConstructorParams = {
  name: string;
  projectName?: string;
  serviceContext?: ServiceContext;
} & ClientParams;
