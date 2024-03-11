# Agents

An “agent” is an automated reasoning and decision engine. It takes in a user input/query and can make internal decisions for executing that query in order to return the correct result. The key agent components can include, but are not limited to:

- Breaking down a complex question into smaller ones
- Choosing an external Tool to use + coming up with parameters for calling the Tool
- Planning out a set of tasks
- Storing previously completed tasks in a memory module

## Getting Started

LlamaIndex.TS comes with a few built-in agents, but you can also create your own. The built-in agents include:

- [OpenAI Agent](./openai.mdx)
