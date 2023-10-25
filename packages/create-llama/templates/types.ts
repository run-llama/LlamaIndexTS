import { PackageManager } from "../helpers/get-pkg-manager";

export type TemplateType = "simple";
export type TemplateMode = "nextjs";

export interface GetTemplateFileArgs {
  template: TemplateType;
  mode: TemplateMode;
  file: string;
}

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;

  template: TemplateType;
  mode: TemplateMode;
  eslint: boolean;
  tailwind: boolean;
  srcDir: boolean;
  importAlias: string;
}
