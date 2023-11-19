import { PackageManager } from "../helpers/get-pkg-manager";

export type TemplateType = "simple" | "streaming";
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
  openAIKey?: string;
  forBackend?: string;
}
