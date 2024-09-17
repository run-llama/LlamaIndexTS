import { LlamaParseReader } from "@llamaindex/cloud/reader";
import "./style.css";

new LlamaParseReader();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    Hello, world!
  </div>
`;
