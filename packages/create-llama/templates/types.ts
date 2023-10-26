import { PackageManager } from "../helpers/get-pkg-manager";

export type TemplateType = "simple";
export type TemplateFramework = "nextjs" | "express";

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
  template: TemplateType;
  framework: TemplateFramework;
  eslint: boolean;
}
