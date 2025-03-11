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
  - `providers/*`: The providers package of LlamaIndex.TS, which contains the providers for LLM and other services.
- `apps/*`: The applications based on LlamaIndex.TS.
  - `next`: Our documentation website based on Next.js.
- `examples`: The code examples of LlamaIndex.TS using Node.js.

## Getting Started

Make sure you have Node.js LTS (Long-term Support) installed. You can check your Node.js version by running:

```shell
node -v
# v20.x.x
```

### Use pnpm

```shell
npm install -g pnpm
```

### Install dependencies

```shell
pnpm install
```

### Build the packages

To build all packages, run:

```shell
pnpm build
```

### Run tests

#### Unit tests

After build, to run all unit tests, call:

```shell
pnpm test
```

Unit tests are located in the `tests` folder of each package. They are using their own package (e.g. `@llamaindex/core-tests` for `@llamaindex/core`). The tests are importing the package under test and the test package is not published.

#### E2E tests

To run all E2E tests, call:

```shell
pnpm e2e
```

All E2E tests are in the `e2e` folder.

### Docs

See the [docs](./apps/next/README.md) for more information.

## Adding a new package

Please follow these steps to add a new package:

1. Only add new packages to the `packages/providers` folder.
2. Use the `package.json` and `tsconfig.json` of an existing packages as template.
3. Reference your new package in the root `tsconfig.json` file
4. Add your package to the `examples/package.json` file if you add a new example.

## Before sending a PR

Before sending a PR, make sure of the following:

1. Tests are all running and you added meaningful tests for your change.
2. If you have a new feature, document it in the `apps/next` docs folder.
3. If you have a new feature, add a new example in the `examples` folder.
4. You have a descriptive changeset for each PR:

### Changesets

We use [changesets](https://github.com/changesets/changesets) for managing versions and changelogs. To create a new
changeset, run in the root folder:

```shell
pnpm changeset
```

## Publishing (maintainers only)

The [Release Github Action](.github/workflows/release.yml) is automatically generating and updating a
PR called "Release {version}".

This PR will update the `package.json` and `CHANGELOG.md` files of each package according to
the current changesets in the [.changeset](.changeset) folder.

If this PR is merged it will automatically add version tags to the repository and publish the updated packages to NPM.
