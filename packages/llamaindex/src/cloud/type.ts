import type { ServiceContext } from "../ServiceContext.js";

export type ClientParams = { apiKey?: string; baseUrl?: string };

export type CloudConstructorParams = {
  name: string;
  projectName: string;
  organizationId?: string;
  serviceContext?: ServiceContext;
} & ClientParams;
