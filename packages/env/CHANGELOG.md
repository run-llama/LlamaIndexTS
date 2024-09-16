# @llamaindex/env

## 0.1.11

### Patch Changes

- ac07e3c: fix: replace instanceof check with `.type` check
- 1a6137b: feat: experimental support for browser

  If you see bundler issue in next.js edge runtime, please bump to `next@14` latest version.

- ac07e3c: fix: add `console.warn` when import dual module

## 0.1.10

### Patch Changes

- 4648da6: fix: wrong tiktoken version caused NextJs CL template run fail

## 0.1.9

### Patch Changes

- 58abc57: fix: align version

## 0.1.8

### Patch Changes

- f326ab8: chore: bump version

## 0.1.7

### Patch Changes

- 41fe871: Add support for azure dynamic session tool

## 0.1.6

### Patch Changes

- d4e853c: fix: stronger type declaration
- a94b8ec: fix: jsr release

## 0.1.5

### Patch Changes

- f3b34b4: Use tiktoken instead of tiktoken/lite and disable WASM tiktoken for non-Node environments

## 0.1.4

### Patch Changes

- 56fabbb: Release env changes to tokenizer

## 0.1.3

### Patch Changes

- e072c45: fix: remove non-standard API `pipeline`
- 9e133ac: refactor: remove `defaultFS` from parameters

  We don't accept passing fs in the parameter since it's unnecessary for a determined JS environment.

  This was a polyfill way for the non-Node.js environment, but now we use another way to polyfill APIs.

## 0.1.2

### Patch Changes

- efa326a: chore: update package.json
- efa326a: refactor: remove usage of lodash

## 0.1.1

### Patch Changes

- 5596e31: feat: improve `@llamaindex/env`

## 0.1.0

### Minor Changes

- 5016f21: feat: improve next.js/cloudflare/vite support

## 0.0.7

### Patch Changes

- Add polyfill for pipeline

## 0.0.6

### Patch Changes

- 7a23cc6: feat: improve CallbackManager

## 0.0.5

### Patch Changes

- 5116ad8: fix: compatibility issue with Deno

## 0.0.4

### Patch Changes

- cf87f84: fix: type backward compatibility

## 0.0.3

### Patch Changes

- e8e21a0: build: set files in package.json

## 0.0.2

### Patch Changes

- 7416a87: build: cjs file not found
