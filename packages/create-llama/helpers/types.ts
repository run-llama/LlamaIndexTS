import { PackageManager } from "../helpers/get-pkg-manager";
import { Tool } from "./tools";

export type TemplateType = "simple" | "streaming" | "community" | "llamapack";
export type TemplateFramework = "nextjs" | "express" | "fastapi";
export type TemplateEngine = "simple" | "context";
export type TemplateUI = "html" | "shadcn";
export type TemplateVectorDB = "none" | "mongo" | "pg" | "pinecone";
export type TemplatePostInstallAction = "none" | "dependencies" | "runApp";
export type TemplateDataSource = {
  type: TemplateDataSourceType;
  config: TemplateDataSourceConfig;
};
export type TemplateDataSourceType = "none" | "file" | "folder" | "web";
// Config for both file and folder
export type FileSourceConfig = {
  path?: string;
};
export type WebSourceConfig = {
  baseUrl?: string;
  depth?: number;
};
export type TemplateDataSourceConfig = FileSourceConfig | WebSourceConfig;

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
  template: TemplateType;
  framework: TemplateFramework;
  engine: TemplateEngine;
  ui: TemplateUI;
  dataSource?: TemplateDataSource;
  eslint: boolean;
  customApiPath?: string;
  openAiKey?: string;
  forBackend?: string;
  model: string;
  communityProjectPath?: string;
  llamapack?: string;
  vectorDb?: TemplateVectorDB;
  externalPort?: number;
  postInstallAction?: TemplatePostInstallAction;
  tools?: Tool[];
}
