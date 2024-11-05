# Contributing

## Structure

This is a monorepo built with Turborepo

Right now, for first-time contributors, these three packages are of the highest importance:

- `packages/llamaindex` which is the main NPM library `llamaindex`
- `examples` is where the demo code lives
- `apps/next` is where the code for the documentation of https://ts.llamaindex.ai/ is located

### Turborepo docs

You can checkout how Turborepo works using the default [README-turborepo.md](/README-turborepo.md)

## Getting Started

Install NodeJS. Preferably v18 using nvm or n.

Inside the LlamaIndexTS directory:

```
pnpm install
```

### Running Typescript

When we publish to NPM we will have a tsc compiled version of the library in JS. For now, the easiest thing to do is use ts-node.

### Test cases

To run them, run

```
pnpm run test
```

To write new test cases write them in [packages/llamaindex/tests](/packages/llamaindex/tests)

We use Vitest https://vitest.dev to write our test cases. Vitest comes with a bunch of built-in assertions using the expect function: https://vitest.dev/api/expect.html#expect

### Demo applications

There is an existing ["example"](/examples/README.md) demos folder with mainly NodeJS scripts. Feel free to add additional demos to that folder. If you would like to try out your changes in the `llamaindex` package with a new demo, you need to run the build command in the README.

You can create new demo applications in the apps folder. Just run pnpm init in the folder after you create it to create its own package.json

### Installing packages

To install packages for a specific package or demo application, run

```
pnpm add [NPM Package] --filter [package or application i.e. llamaindex or docs]
```

To install packages for every package or application run

```
pnpm add -w [NPM Package]
```

### Doc

To contribute to the docs, go to the docs website folder and run the Next.js server:

```bash
# run this if you are first time
pnpx turbo run build --filter @llamaindex/doc
cd apps/next
pnpm run dev
```

## Changeset

We use [changesets](https://github.com/changesets/changesets) for managing versions and changelogs. To create a new changeset, run in the root folder:

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
