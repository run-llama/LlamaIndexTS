# Create LlamaIndex App

The easiest way to get started with [LlamaIndex](https://www.llamaindex.ai/) is by using `create-llama`. This CLI tool enables you to quickly start building a new LlamaIndex application, with everything set up for you. 

## Features

- NextJS, ExpressJS, or FastAPI (python) stateless backend generation 💻
- Streaming or non-streaming backend ⚡
- Optional `shadcn` or `html` frontend generation 🎨

## Get Started

You can run `create-llama` in interactive or non-interatactive mode.

### Interactive

You can create a new project interactively by running:

```bash
npx create-llama@latest
# or
npm create llama
# or
yarn create llama
# or
pnpm create llama
```

You will be asked for the name of your project, along with other configuration options.

Here is an example:

```bash
>> npm create llama
Need to install the following packages:
  create-llama@0.0.3
Ok to proceed? (y) y
✔ What is your project named? … my-app
✔ Which template would you like to use? › Chat with streaming
✔ Which framework would you like to use? › NextJS
✔ Which UI would you like to use? › Just HTML
✔ Which chat engine would you like to use? › ContextChatEngine
✔ Please provide your OpenAI API key (leave blank to skip): … 
✔ Would you like to use ESLint? … No / Yes
Creating a new LlamaIndex app in /home/my-app.
```

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

```

## LlamaIndex Documentation

- [TS/JS docs](https://ts.llamaindex.ai/)
- [Python docs](https://docs.llamaindex.ai/en/stable/)
