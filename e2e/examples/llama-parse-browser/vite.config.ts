import wasm from "vite-plugin-wasm";

export default {
  plugins: [wasm()],
  ssr: {
    external: ["tiktoken"],
  },
};
