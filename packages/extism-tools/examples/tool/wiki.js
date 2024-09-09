import { ExtismToolFactory } from "../../dist/ExtismToolFactory.js";

async function main() {
  const WikiTool = await ExtismToolFactory.createToolClass({
    wasmFilename: "wiki.wasm",
    allowedHosts: ["*.wikipedia.org"],
    transformResponse: (response) => response.extract,
  });
  const wikiTool = new WikiTool();
  await wikiTool.call({ query: "Sydney City" }).then(console.log);
  await wikiTool.call({ query: "Ho Chi Minh City" }).then(console.log);
}

void main();
