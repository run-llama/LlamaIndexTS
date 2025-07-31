// Deprecation warning
console.warn(`
The package @llamaindex/cloud has been deprecated since version 4.1.0
 * Please migrate to llama-cloud-services.
 * See the documentation: https://docs.cloud.llamaindex.ai
`);

import { client } from "./client/client.gen";

client.setConfig({
  baseUrl: "https://api.cloud.llamaindex.ai/",
  headers: {
    "X-SDK-Name": "llamaindex-ts",
  },
});

export * from "./client";
export { client };
