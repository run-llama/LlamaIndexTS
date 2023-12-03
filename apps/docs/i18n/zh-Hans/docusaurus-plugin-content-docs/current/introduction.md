---
sidebar_position: 0
slug: /
---

# 什么是LlamaIndex.TS?

LlamaIndex.TS是用于LLM应用程序摄取、构造和访问私有或特定领域数据的数据框架。虽然也提供了Python软件包（请参阅[此处](https://docs.llamaindex.ai/en/stable/)），但LlamaIndex.TS在一个简单的软件包中提供了核心功能，并针对在TypeScript中的使用进行了优化。

## 🚀 为什么选择LlamaIndex.TS？

从本质上讲，LLM提供了人类和推断数据之间的自然语言接口。广泛可用的模型预先在大量公开可用的数据上进行了预训练，这些数据来自维基百科、邮件列表、教科书和源代码。

建立在LLM之上的应用程序通常需要使用私有或特定领域的数据来增强这些模型。不幸的是，这些数据可能分布在孤立的应用程序和数据存储中。它们可能位于API后面、SQL数据库中，或者被困在PDF和幻灯片中。

这就是**LlamaIndex.TS**发挥作用的地方。

## 🦙 LlamaIndex.TS如何帮助？

LlamaIndex.TS提供以下工具：

- **数据加载**：直接摄取您现有的`.txt`、`.pdf`、`.csv`、`.md`和`.docx`数据
- **数据索引**：将您的数据结构化为中间表示，易于LLM消费并具有高性能。
- **引擎**：为您的数据提供自然语言访问。例如：
  - 查询引擎是用于知识增强输出的强大检索接口。
  - 聊天引擎是用于与您的数据进行多消息“来回”交互的对话接口。

## 👨‍👩‍👧‍👦 LlamaIndex适用于谁？

LlamaIndex.TS提供了一组核心工具，对于任何使用JavaScript和TypeScript构建LLM应用程序的人来说都是必不可少的。

我们的高级API允许初学者使用LlamaIndex.TS来摄取和查询他们的数据。

对于更复杂的应用程序，我们的低级API允许高级用户自定义和扩展任何模块——数据连接器、索引、检索器和查询引擎，以满足他们的需求。

## 入门指南

`npm install llamaindex`

我们的文档包括[安装说明](./installation.md)和[入门教程](./starter.md)，以构建您的第一个应用程序。

一旦您开始运行，[高级概念](./concepts.md)概述了LlamaIndex的模块化架构。要获取更多实用示例，请浏览我们的[端到端教程](./end_to_end.md)。

## 🗺️ 生态系统

要下载或贡献，请在以下位置找到LlamaIndex：

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

## 社区

需要帮助吗？有功能建议吗？加入LlamaIndex社区：

- Twitter: https://twitter.com/llama_index
- Discord https://discord.gg/dGcwcsnxhU
