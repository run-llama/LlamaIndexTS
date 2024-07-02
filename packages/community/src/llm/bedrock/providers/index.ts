import { Provider } from "../provider";
import { AnthropicProvider } from "./anthropic";
import { MetaProvider } from "./meta";

// Other providers should go here
export const PROVIDERS: { [key: string]: Provider } = {
  anthropic: new AnthropicProvider(),
  meta: new MetaProvider(),
};
