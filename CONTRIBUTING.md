# Contributing

## Structure

LlamaIndex.TS uses pnpm monorepo.

We recommend you to understand the basics of Node.js, TypeScript, pnpm, and of course, LLM before contributing.

There are some important folders in the repository:

- `packages/*`: Contains the source code of the packages. Each package is a separate npm package.
  - `llamaindex`: The starter package for LlamaIndex.TS, which contains the all sub-packages.
  - `core`: The core package of LlamaIndex.TS, which contains the abstract classes and interfaces. It is designed for
    all JS runtime environments.
  - `env`: The environment package of LlamaIndex.TS, which contains the environment-specific classes and interfaces. It
    includes compatibility layers for Node.js, Deno, Vercel Edge Runtime, Cloudflare Workers...
- `apps/*`: The applications based on LlamaIndex.TS.
  - `next`: Our documentation website based on Next.js.
- `examples`: The code examples of LlamaIndex.TS using Node.js.

## Getting Started

Make sure you have Node.js LIS (Long-term Support) installed. You can check your Node.js version by running:

```shell
node -v
# v20.x.x
```

### Use pnpm

```shell
corepack enable
```

### Install dependencies

```shell
pnpm install
```

### Build the packages

```shell
# Build all packages
turbo build --filter "./packages/*"
```

### Docs

See the [docs](./apps/next/README.md) for more information.

## Changeset

We use [changesets](https://github.com/changesets/changesets) for managing versions and changelogs. To create a new
changeset, run in the root folder:

```
pnpm changeset
```

Please send a descriptive changeset for each PR.

## Publishing (maintainers only)

The [Release Github Action](.github/workflows/release.yml) is automatically generating and updating a
PR called "Release {version}".

This PR will update the `package.json` and `CHANGELOG.md` files of each package according to
the current changesets in the [.changeset](.changeset) folder.

If this PR is merged it will automatically add version tags to the repository and publish the updated packages to NPM.
