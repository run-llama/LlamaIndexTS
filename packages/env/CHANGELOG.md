# @llamaindex/env

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
