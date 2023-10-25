# Create Next App

The easiest way to get started with LlamaIndex is by using `create-llama`. This CLI tool enables you to quickly start building a new LlamaIndex application, with everything set up for you. You can create a new app using the default LlamaIndex template, or by using one of the [official LlamaIndex examples](https://github.com/vercel/next.js/tree/canary/examples). To get started, use the following command:

### Interactive

You can create a new project interactively by running:

```bash
npx create-llama@latest
# or
yarn create next-app
# or
pnpm create next-app
# or
bunx create-llama
```

You will be asked for the name of your project, and then whether you want to
create a TypeScript project:

```bash
✔ Would you like to use TypeScript? … No / Yes
```

Select **Yes** to install the necessary types/dependencies and create a new TS project.

### Non-interactive

You can also pass command line arguments to set up a new project
non-interactively. See `create-llama --help`:

```bash
create-llama <project-directory> [options]

Options:
  -V, --version                      output the version number
 

  --use-npm

    Explicitly tell the CLI to bootstrap the app using npm

  --use-pnpm

    Explicitly tell the CLI to bootstrap the app using pnpm

  --use-yarn

    Explicitly tell the CLI to bootstrap the app using Yarn

  --use-bun

    Explicitly tell the CLI to bootstrap the app using Bun

  -e, --example [name]|[github-url]

    An example to bootstrap the app with. You can use an example name
    from the official LlamaIndex repo or a GitHub URL. The URL can use
    any branch and/or subdirectory

  --example-path <path-to-example>

    In a rare case, your GitHub URL might contain a branch name with
    a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
    In this case, you must specify the path to the example separately:
    --example-path foo/bar
```

### Why use Create Next App?

`create-llama` allows you to create a new LlamaIndex app within seconds. It is officially maintained by the creators of LlamaIndex, and includes a number of benefits:

- **Interactive Experience**: Running `npx create-llama@latest` (with no arguments) launches an interactive experience that guides you through setting up a project.
- **Zero Dependencies**: Initializing a project is as quick as one second. Create Next App has zero dependencies.
- **Offline Support**: Create Next App will automatically detect if you're offline and bootstrap your project using your local package cache.
- **Support for Examples**: Create Next App can bootstrap your application using an example from the LlamaIndex examples collection (e.g. `npx create-llama --example api-routes`).
- **Tested**: The package is part of the LlamaIndex monorepo and tested using the same integration test suite as LlamaIndex itself, ensuring it works as expected with every release.
