type PromptConfig = {
  llm?: string;
  lang?: string;
};

interface Config {
  prompt: PromptConfig;
}

// Determine the global object based on the environment
const globalObject: any =
  typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
      ? global
      : {};

// Initialize or access a global config object
const globalConfigKey = "__GLOBAL_LITS__";

if (!globalObject[globalConfigKey]) {
  globalObject[globalConfigKey] = {
    prompt: {},
  } satisfies Config;
}

export const Settings: Config = globalObject[globalConfigKey];
