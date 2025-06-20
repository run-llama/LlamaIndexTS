import { LlamaIndexAdapter } from "./base";
import { VercelMessageAdapter } from "./vercel";

export { LlamaIndexAdapter, VercelMessageAdapter };

export type DefaultAdapters = {
  llamaindex: typeof LlamaIndexAdapter;
  vercel: VercelMessageAdapter;
};
