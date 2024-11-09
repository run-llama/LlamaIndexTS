import type { InitializeHook, LoadHook } from "node:module";
import { extname } from "node:path";
import { FILE_EXT_TO_READER } from "../directory";

let packageDir: string;

export const initialize: InitializeHook = (data: { packageDir: string }) => {
  packageDir = data.packageDir;
};

export const load: LoadHook = async (url, context, nextLoad) => {
  const ext: string | undefined = extname(url).slice(1);
  if (ext && FILE_EXT_TO_READER[ext]) {
    return {
      format: "module",
      shortCircuit: true,
      source: `import { FILE_EXT_TO_READER } from '${packageDir}directory/dist/index.js';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const path = fileURLToPath(new URL('${url}'));
export default (await FILE_EXT_TO_READER['${ext}'].loadData(path))[0];`,
    };
  }
  return nextLoad(url, context);
};
