---
sidebar_position: 4
---

# 端到端示例

我们在存储库中包含了使用 LlamaIndex.TS 的几个端到端示例

查看下面的示例，或者尝试并在几分钟内完成交互式 Github Codespace 教程，由 Dev-Docs 提供 [这里](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [聊天引擎](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

读取文件并与 LLM 进行讨论。

## [向量索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

创建一个向量索引并对其进行查询。向量索引将使用嵌入来获取前 k 个最相关的节点。默认情况下，k 的值为 2。

## [摘要索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

创建一个列表索引并对其进行查询。该示例还使用了 `LLMRetriever`，它将使用 LLM 来选择生成答案时要使用的最佳节点。

## [保存 / 加载索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

创建并加载向量索引。在 LlamaIndex.TS 中，一旦创建存储上下文对象，将自动将数据持久化到磁盘中。

## [自定义向量索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

创建一个向量索引并对其进行查询，同时还配置 `LLM`、`ServiceContext` 和 `similarity_top_k`。

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

创建一个 OpenAI LLM 并直接用于聊天。

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

创建一个 Llama-2 LLM 并直接用于聊天。

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

使用 `SubQuestionQueryEngine`，它将复杂查询分解为多个问题，然后聚合所有子问题的答案。

## [低级模块](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

该示例使用了几个低级组件，消除了对实际查询引擎的需求。这些组件可以在任何地方、任何应用程序中使用，也可以进行定制和子类化以满足您自己的需求。
