---
sidebar_position: 4
---

# 端到端示例

我们在仓库中包含了使用 LlamaIndex.TS 的几个端到端示例

请查看下面的示例，或者通过 Dev-Docs 提供的交互式 Github Codespace 教程在几分钟内尝试并完成它们[这里](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json)：

## [聊天引擎 (Chat Engine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

读取一个文件并与 LLM 聊天。

## [向量索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

创建一个向量索引并查询它。向量索引将使用嵌入来获取最相关的前 k 个节点。默认情况下，前 k 为 2。

## [摘要索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

创建一个列表索引并查询它。这个示例还使用了 `LLMRetriever`，它将利用 LLM 选择最佳节点来生成答案时使用。

## [保存 / 加载索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

创建并加载向量索引。在 LlamaIndex.TS 中，一旦创建了存储上下文对象，数据持久化到磁盘就会自动进行。

## [自定义向量索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

创建一个向量索引并查询它，同时配置 `LLM`、`ServiceContext` 和 `similarity_top_k`。

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

创建一个 OpenAI LLM 并直接用于聊天。

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

创建一个 Llama-2 LLM 并直接用于聊天。

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

使用 `SubQuestionQueryEngine`（子问题查询引擎），它将复杂的查询分解成多个问题，然后跨所有子问题的答案聚合响应。

## [低级模块 (Low Level Modules)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

此示例使用了几个低级组件，这消除了对实际查询引擎的需求。这些组件可以在任何地方、任何应用程序中使用，或者自定义和子类化以满足您自己的需求。
