import { LlamaParseReader } from "@llamaindex/cloud";
import "./style.css";

new LlamaParseReader();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    Hello, world!
  </div>
`;
