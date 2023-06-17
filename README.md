# LlamaScript: LlamaIndex for TS/JS

## Structure

This is a monorepo built with Turborepo

Right now there are two packages of importance:

packages/core which is the main NPM library @llamaindex/core

apps/simple is where the demo code lives

### Turborepo docs

You can checkout how Turborepo works using the built in [README-turborepo.md](README-turborepo.md)

## Getting Started

Install NodeJS. Preferably v18 using nvm or n.

Inside the llamascript directory:

```
npm i -g pnpm ts-node
pnpm install
```

Note: we use pnpm in this repo, which has a lot of the same functionality and CLI options as npm but it does do some things better in a monorepo, like centralizing dependencies and caching.

PNPM's has documentation on its [workspace feature](https://pnpm.io/workspaces) and Turborepo had some [useful documentation also](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks).

### Test cases

To run them, run

```
pnpm run test
```

To write new test cases write them in packages/core/src/tests

We use Jest https://jestjs.io/ to write our test cases. Jest comes with a bunch of built in assertions using the expect function: https://jestjs.io/docs/expect

### Demo applications

You can create new demo applications in the apps folder. Just run pnpm init in the folder after you create it to create its own package.json

### Installing packages

To install packages for a specific package or demo application, run

```
pnpm add [NPM Package] --filter [package or application i.e. core or simple]
```

To install packages for every package or application run

```
pnpm add -w [NPM Package]
```
