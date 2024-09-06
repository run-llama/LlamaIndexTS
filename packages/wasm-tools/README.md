## Usage

```ts
import { TestTool } from "@llamaindex/wasm-tools";
const testTool = new TestTool();
testTool.call("1"); // get post has id = 1 (url: https://jsonplaceholder.typicode.com/todos?id=1)
```

## Extism

### Prerequisites

- [Extism CLI](https://github.com/extism/cli?tab=readme-ov-file#installation)
- [Extism PDK](https://github.com/extism/js-pdk?tab=readme-ov-file#linux-macos)

### Build WASM files

```bash
cd packages/wasm-tools/extism/wiki
extism-js wiki.js -i wiki.d.ts -o wiki.wasm
```

### Test WASM files

```bash
extism call wiki.wasm wikiCall --wasi --allow-host "*.wikipedia.org" --input='{"query": "Ho Chi Minh City"}'
```

### Run WASM files in Node.js

```bash
node examples/wiki.js
```

### Run WASM files in Python

```bash
python examples/wiki.py
```