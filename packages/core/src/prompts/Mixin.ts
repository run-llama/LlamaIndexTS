type PromptsDict = Record<string, any>;
type ModuleDict = Record<string, any>;

export class PromptMixin {
  /**
   * Validates the prompt keys and module keys
   * @param promptsDict
   * @param moduleDict
   */
  validatePrompts(promptsDict: PromptsDict, moduleDict: ModuleDict): void {
    for (const key in promptsDict) {
      if (key.includes(":")) {
        throw new Error(`Prompt key ${key} cannot contain ':'.`);
      }
    }

    for (const key in moduleDict) {
      if (key.includes(":")) {
        throw new Error(`Module key ${key} cannot contain ':'.`);
      }
    }
  }

  /**
   * Returns all prompts from the mixin and its modules
   */
  getPrompts(): PromptsDict {
    const promptsDict: PromptsDict = this._getPrompts();

    const moduleDict = this._getPromptModules();

    this.validatePrompts(promptsDict, moduleDict);

    const allPrompts: PromptsDict = { ...promptsDict };

    for (const [module_name, prompt_module] of Object.entries(moduleDict)) {
      for (const [key, prompt] of Object.entries(prompt_module.getPrompts())) {
        allPrompts[`${module_name}:${key}`] = prompt;
      }
    }
    return allPrompts;
  }

  /**
   * Updates the prompts in the mixin and its modules
   * @param promptsDict
   */
  updatePrompts(promptsDict: PromptsDict): void {
    const promptModules = this._getPromptModules();

    this._updatePrompts(promptsDict);

    const subPromptDicts: Record<string, PromptsDict> = {};

    for (const key in promptsDict) {
      if (key.includes(":")) {
        const [module_name, sub_key] = key.split(":");

        if (!subPromptDicts[module_name]) {
          subPromptDicts[module_name] = {};
        }
        subPromptDicts[module_name][sub_key] = promptsDict[key];
      }
    }

    for (const [module_name, subPromptDict] of Object.entries(subPromptDicts)) {
      if (!promptModules[module_name]) {
        throw new Error(`Module ${module_name} not found.`);
      }

      const moduleToUpdate = promptModules[module_name];

      moduleToUpdate.updatePrompts(subPromptDict);
    }
  }

  // Must be implemented by subclasses
  protected _getPrompts(): PromptsDict {
    return {};
  }

  protected _getPromptModules(): Record<string, any> {
    return {};
  }

  protected _updatePrompts(promptsDict: PromptsDict): void {
    return;
  }
}
