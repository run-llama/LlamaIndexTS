# Create LlamaIndex App

The easiest way to get started with LlamaIndex is by using `create-llama`. This CLI tool enables you to quickly start building a new LlamaIndex application, with everything set up for you. 
To get started, use the following command:

### Interactive

You can create a new project interactively by running:

```bash
npx create-llama@latest
# or
yarn create llama-app
# or
pnpm create llama-app
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

```

