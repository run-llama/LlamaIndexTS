## Extism Tools

### Prerequisites for Development

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

### Run WASM files in Node.js using Extism SDK (https://github.com/extism/js-sdk)

```bash
node examples/wiki.js
```

### Run WASM files in Python using Extism SDK (https://github.com/extism/python-sdk)

```bash
python examples/wiki.py
```
