import { z } from "zod";
import { PackageManager } from "../helpers/get-pkg-manager";

export const templateTypeSchema = z.enum(["simple", "streaming"]);
export type TemplateType = z.infer<typeof templateTypeSchema>;
export const templateFrameworkSchema = z.enum(["nextjs", "express", "fastapi"]);
export type TemplateFramework = z.infer<typeof templateFrameworkSchema>;
export const templateEngineSchema = z.enum(["simple", "context"]);
export type TemplateEngine = z.infer<typeof templateEngineSchema>;
export const templateUISchema = z.enum(["html", "shadcn"]);
export type TemplateUI = z.infer<typeof templateUISchema>;

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
