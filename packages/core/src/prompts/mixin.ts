import { objectEntries } from "../utils";
import type { BasePromptTemplate } from "./base";

export type PromptsRecord = Record<string, BasePromptTemplate>;
export type ModuleRecord = Record<string, PromptMixin>;

export abstract class PromptMixin {
  validatePrompts(promptsDict: PromptsRecord, moduleDict: ModuleRecord): void {
    for (const key of Object.keys(promptsDict)) {
      if (key.includes(":")) {
        throw new Error(`Prompt key ${key} cannot contain ':'.`);
      }
    }

    for (const key of Object.keys(moduleDict)) {
      if (key.includes(":")) {
        throw new Error(`Module key ${key} cannot contain ':'.`);
      }
    }
  }

  getPrompts(): PromptsRecord {
    const promptsDict: PromptsRecord = this._getPrompts();

    const moduleDict = this._getPromptModules();

    this.validatePrompts(promptsDict, moduleDict);

    const allPrompts: PromptsRecord = { ...promptsDict };

    for (const [module_name, prompt_module] of objectEntries(moduleDict)) {
      for (const [key, prompt] of objectEntries(prompt_module.getPrompts())) {
        allPrompts[`${module_name}:${key}`] = prompt;
      }
    }
    return allPrompts;
  }

  updatePrompts(prompts: PromptsRecord): void {
    const promptModules = this._getPromptModules();

    this._updatePrompts(prompts);

    const subPrompt: Record<string, PromptsRecord> = {};

    for (const key in prompts) {
      if (key.includes(":")) {
        const [moduleName, subKey] = key.split(":") as [string, string];

        if (!subPrompt[moduleName]) {
          subPrompt[moduleName] = {};
        }
        subPrompt[moduleName][subKey] = prompts[key]!;
      }
    }

    for (const [moduleName, subPromptDict] of Object.entries(subPrompt)) {
      if (!promptModules[moduleName]) {
        throw new Error(`Module ${moduleName} not found.`);
      }

      const moduleToUpdate = promptModules[moduleName];

      moduleToUpdate.updatePrompts(subPromptDict);
    }
  }

  protected abstract _getPrompts(): PromptsRecord;
  protected abstract _updatePrompts(prompts: PromptsRecord): void;

  /**
   *
   * Return a dictionary of sub-modules within the current module
   * that also implement PromptMixin (so that their prompts can also be get/set).
   *
   * Can be blank if no sub-modules.
   */
  protected abstract _getPromptModules(): ModuleRecord;
}
