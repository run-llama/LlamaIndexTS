import { PackageManager } from "../helpers/get-pkg-manager";

export type TemplateType = "simple" | "streaming" | "community";
export type TemplateFramework = "nextjs" | "express" | "fastapi";
export type TemplateEngine = "simple" | "context";
export type TemplateUI = "html" | "shadcn";

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
  template: TemplateType;
  framework: TemplateFramework;
  engine?: TemplateEngine;
  ui: TemplateUI;
  eslint: boolean;
  customApiPath?: string;
  openAiKey?: string;
  forBackend?: string;
  model: string;
  communityProjectPath?: string;
}
