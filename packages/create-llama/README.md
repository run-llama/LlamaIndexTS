# Create LlamaIndex App

The easiest way to get started with [LlamaIndex](https://www.llamaindex.ai/) is by using `create-llama`. This CLI tool enables you to quickly start building a new LlamaIndex application, with everything set up for you.

Just run

```bash
npx create-llama@latest
```

to get started, or see below for more options. Once your app is generated, run

```bash
npm run dev
```

to start the development server. You can then visit [http://localhost:3000](http://localhost:3000) to see your app.

## What you'll get

- A Next.js-powered front-end. The app is set up as a chat interface that can answer questions about your data (see below)
  - You can style it with HTML and CSS, or you can optionally use components from [shadcn/ui](https://ui.shadcn.com/)
- Your choice of 3 back-ends:
  - **Next.js**: if you select this option, you’ll have a full stack Next.js application that you can deploy to a host like [Vercel](https://vercel.com/) in just a few clicks. This uses [LlamaIndex.TS](https://www.npmjs.com/package/llamaindex), our TypeScript library.
  - **Express**: if you want a more traditional Node.js application you can generate an Express backend. This also uses LlamaIndex.TS.
  - **Python FastAPI**: if you select this option you’ll get a backend powered by the [llama-index python package](https://pypi.org/project/llama-index/), which you can deploy to a service like Render or fly.io.
- The back-end has a single endpoint that allows you to send the state of your chat and receive additional responses
- You can choose whether you want a streaming or non-streaming back-end (if you're not sure, we recommend streaming)
- You can choose whether you want to use `ContextChatEngine` or `SimpleChatEngine`
  - `SimpleChatEngine` will just talk to the LLM directly without using your data
  - `ContextChatEngine` will use your data to answer questions (see below).
- The app uses OpenAI by default, so you'll need an OpenAI API key, or you can customize it to use any of the dozens of LLMs we support.

## Using your data

If you've enabled `ContextChatEngine`, you can supply your own data and the app will index it and answer questions. Your generated app will have a folder called `data`:

- With the Next.js backend this is `./data`
- With the Express or Python backend this is in `./backend/data`

The app will ingest any supported files you put in this directory. Your Next.js and Express apps use LlamaIndex.TS so they will be able to ingest any PDF, text, CSV, Markdown, Word and HTML files. The Python backend can read even more types, including video and audio files.

Before you can use your data, you need to index it. If you're using the Next.js or Express apps, run:

```bash
npm run generate
```

Then re-start your app. Remember you'll need to re-run `generate` if you add new files to your `data` folder. If you're using the Python backend, you can trigger indexing of your data by deleting the `./storage` folder and re-starting the app.

## Don't want a front-end?

It's optional! If you've selected the Python or Express back-ends, just delete the `frontend` folder and you'll get an API without any front-end code.

## Customizing the LLM

By default the app will use OpenAI's gpt-3.5-turbo model. If you want to use GPT-4, you can modify this by editing a file:

- In the Next.js backend, edit `./app/api/chat/route.ts` and replace `gpt-3.5-turbo` with `gpt-4`
- In the Express backend, edit `./backend/src/controllers/chat.controller.ts` and likewise replace `gpt-3.5-turbo` with `gpt-4`
- In the Python backend, edit `./backend/app/utils/index.py` and once again replace `gpt-3.5-turbo` with `gpt-4`

You can also replace OpenAI with one of our [dozens of other supported LLMs](https://docs.llamaindex.ai/en/stable/module_guides/models/llms/modules.html).

## Example

The simplest thing to do is run `create-llama` in interactive mode:

```bash
npx create-llama@latest
# or
npm create llama@latest
# or
yarn create llama
# or
pnpm create llama@latest
```

You will be asked for the name of your project, along with other configuration options, something like this:

```bash
>> npm create llama@latest
Need to install the following packages:
  create-llama@latest
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

### Running non-interactively

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

Inspired by and adapted from [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)
