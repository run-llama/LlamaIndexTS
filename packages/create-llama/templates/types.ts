import { PackageManager } from "../helpers/get-pkg-manager";

export type TemplateType = "simple";
export type TemplateFramework = "nextjs" | "express";

export interface GetTemplateFileArgs {
  template: TemplateType;
  framework: TemplateFramework;
  file: string;
}

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
  template: TemplateType;
  framework: TemplateFramework;
  eslint: boolean;
  srcDir: boolean;
  importAlias: string;
}
