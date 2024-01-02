---
sidebar_position: 0
slug: /
---

# 什么是 LlamaIndex.TS？

LlamaIndex.TS 是一个数据框架，用于LLM应用程序摄取、结构化和访问私有或特定领域的数据。虽然也提供了Python包（参见[这里](https://docs.llamaindex.ai/en/stable/)），但LlamaIndex.TS提供了一些核心功能，在一个简单的包中，为TypeScript的使用进行了优化。

## 🚀 为什么选择 LlamaIndex.TS？

从本质上讲，LLM提供了人类与推断数据之间的自然语言接口。广泛可用的模型预先训练了大量公开可用的数据，包括维基百科、邮件列表、教科书和源代码。

基于LLM构建的应用程序通常需要用私有或特定领域的数据增强这些模型。不幸的是，这些数据可能分布在孤立的应用程序和数据存储中。它们可能隐藏在API后面，存储在SQL数据库中，或者被困在PDF和幻灯片中。

这就是 **LlamaIndex.TS** 发挥作用的地方。

## 🦙 LlamaIndex.TS 能提供哪些帮助？

LlamaIndex.TS 提供以下工具：

- **数据加载** 直接摄取您现有的 `.txt`、`.pdf`、`.csv`、`.md` 和 `.docx` 数据
- **数据索引** 将您的数据结构化为中间表示，这些表示对LLMs来说易于消费且性能优越。
- **引擎** 为您的数据提供自然语言访问。例如：
  - 查询引擎（Query engines）是强大的检索界面，用于知识增强输出。
  - 聊天引擎（Chat engines）是对话式界面，用于与您的数据进行多消息的“来回”互动。

## 👨‍👩‍👧‍👦 谁适合使用 LlamaIndex？

LlamaIndex.TS 提供了一套核心工具，对于任何使用JavaScript和TypeScript构建LLM应用程序的人来说都是必不可少的。

我们的高级API允许初级用户使用LlamaIndex.TS来摄取和查询他们的数据。

对于更复杂的应用程序，我们的低级API允许高级用户自定义和扩展任何模块——数据连接器、索引、检索器和查询引擎，以适应他们的需求。

## 入门

`npm install llamaindex`

我们的文档包括[安装说明](./installation.mdx)和一个[入门教程](./starter.md)，帮助你构建第一个应用程序。

一旦你开始运行，[高级概念](./concepts.md)有一个LlamaIndex模块化架构的概览。更多实践例子，请浏览我们的[端到端教程](./end_to_end.md)。

## 🗺️ 生态系统

要下载或贡献，请在以下位置找到LlamaIndex：

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

## 社区

需要帮助？有功能建议？加入LlamaIndex社区：

- Twitter: https://twitter.com/llama_index
- Discord: https://discord.gg/dGcwcsnxhU
