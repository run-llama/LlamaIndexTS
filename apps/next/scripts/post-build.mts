import env from "@next/env";

import { updateLlamaCloud } from "./update-llamacloud.mjs";

env.loadEnvConfig(process.cwd());

await updateLlamaCloud();
