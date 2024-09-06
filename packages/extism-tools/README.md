## Extism Tools

### Prerequisites for Development

- [Extism PDK](https://github.com/extism/js-pdk?tab=readme-ov-file#linux-macos)

### Build WASM files

```bash
cd packages/wasm-tools/extism/wiki
extism-js wiki.js -i wiki.d.ts -o wiki.wasm
```

### Run WASM files in Node.js using Extism SDK (https://github.com/extism/js-sdk)

```bash
node examples/wasm/wiki.js
```

### Test using WASM tool with OpenAI Agent

```bash
node examples/tool/WikipediaTool.js
```

### Run WASM files in Python using Extism SDK (https://github.com/extism/python-sdk)

```bash
python examples/wasm/wiki.py
```
