---
sidebar_position: 1
---

# Installation and Setup

## Installation from NPM

Make sure you have NodeJS v18 or higher.

```bash npm2yarn
npm install llamaindex
```

## Environment variables

Our examples use OpenAI by default. You'll need to set up your Open AI key like so:

```bash
export OPENAI_API_KEY="sk-......" # Replace with your key from https://platform.openai.com/account/api-keys
```

If you want to have it automatically loaded every time, add it to your .zshrc/.bashrc.

WARNING: do not check in your OpenAI key into version control.
