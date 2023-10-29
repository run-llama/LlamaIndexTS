# Guide to test in browser

1. clone LlamaIndexTS
2. split terminal, one in packges/core the other in examples/browser_example
3. in packages/core:
```
npm i
npm run old-build # optional, run it once to generate the .d.ts file
npm run build # wepback bundling
```
4. in examples/browser_example
```
npm i
npm run build # webpack bundling
cd dist
python3 -m http.server
```
5. Open browser to localhost:8000, select a text file (e.g abramov), a question, wait a bit and the answer should appear below!
