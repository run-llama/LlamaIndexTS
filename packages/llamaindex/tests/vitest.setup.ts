// eslint-disable-next-line turbo/no-undeclared-env-vars
process.env.OPENAI_API_KEY = "sk-1234567890abcdef1234567890abcdef";
const originalFetch = globalThis.fetch;

globalThis.fetch = function fetch(...args: Parameters<typeof originalFetch>) {
  let url = args[0];
  if (typeof url !== "string") {
    if (url instanceof Request) {
      url = url.url;
    } else {
      url = url.toString();
    }
  }
  const { host } = new URL(url);
  if (host.endsWith("openai.com")) {
    // todo: mock api using https://mswjs.io
    throw new Error(
      "Make sure to return a mock response for OpenAI API requests in your test.",
    );
  }
  return originalFetch(...args);
};
