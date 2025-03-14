import env from "@next/env";

import { updateLlamaCloud } from "./update-llamacloud.mjs";

env.loadEnvConfig(process.cwd());

if (process.env.VERCEL_ENV === "production") {
  updateLlamaCloud().catch((error) => {
    console.error(error);
  });
}
