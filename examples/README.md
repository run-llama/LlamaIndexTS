# Simple Examples

Before running any of the examples, make sure to set your OpenAI environment variable:

```bash
export OPENAI_API_KEY="sk-..."
```

There are two ways to run the examples, using the latest published version of `llamaindex` or using a local build.

## Using the latest published version

Make sure to call `npm install` before running these examples:

```bash
npm install
```

Then run the examples with `ts-node`, for example `npx ts-node vectorIndex.ts`

## Using the local build

```bash
pnpm install
pnpm --filter llamaindex build
pnpm link ../packages/core
```

Then run the examples with `ts-node`, for example `pnpx ts-node vectorIndex.ts`
