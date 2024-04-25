# Contributing

## Structure

This is a monorepo built with Turborepo

Right now there are two packages of importance:

packages/core which is the main NPM library llamaindex

examples is where the demo code lives

### Turborepo docs

You can checkout how Turborepo works using the default [README-turborepo.md](/README-turborepo.md)

## Getting Started

Install NodeJS. Preferably v18 using nvm or n.

Inside the LlamaIndexTS directory:

```
npm i -g pnpm ts-node
pnpm install
```

Note: we use pnpm in this repo, which has a lot of the same functionality and CLI options as npm but it does do some things better in a monorepo, like centralizing dependencies and caching.

PNPM's has documentation on its [workspace feature](https://pnpm.io/workspaces) and Turborepo had some [useful documentation also](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks).

### Running Typescript

When we publish to NPM we will have a tsc compiled version of the library in JS. For now, the easiest thing to do is use ts-node.

### Test cases

To run them, run

```
pnpm run test
```

To write new test cases write them in [packages/core/src/tests](/packages/core/src/tests)

We use Jest https://jestjs.io/ to write our test cases. Jest comes with a bunch of built in assertions using the expect function: https://jestjs.io/docs/expect

### Demo applications

There is an existing ["example"](/examples/README.md) demos folder with mainly NodeJS scripts. Feel free to add additional demos to that folder. If you would like to try out your changes in the core package with a new demo, you need to run the build command in the README.

You can create new demo applications in the apps folder. Just run pnpm init in the folder after you create it to create its own package.json

### Installing packages

To install packages for a specific package or demo application, run

```
pnpm add [NPM Package] --filter [package or application i.e. core or docs]
```

To install packages for every package or application run

```
pnpm add -w [NPM Package]
```

### Docs

To contribute to the docs, go to the docs website folder and run the Docusaurus instance.

```bash
cd apps/docs
pnpm install
pnpm start
```

That should start a webserver which will serve the docs on https://localhost:3000

Any changes you make should be reflected in the browser. If you need to regenerate the API docs and find that your TSDoc isn't getting the updates, feel free to remove apps/docs/api. It will automatically regenerate itself when you run pnpm start again.

## Changeset

We use [changesets](https://github.com/changesets/changesets) for managing versions and changelogs. To create a new changeset, run:

```
pnpm changeset
```

Please send a descriptive changeset for each PR.

## Publishing (maintainers only)

The [Release Github Action](.github/workflows/release.yml) is automatically generating and updating a
PR called "Release {version}".

This PR will update the `package.json` and `CHANGELOG.md` files of each package according to
the current changesets in the [.changeset](.changeset/) folder.

If this PR is merged it will automatically add version tags to the repository and publish the updated packages to NPM.
