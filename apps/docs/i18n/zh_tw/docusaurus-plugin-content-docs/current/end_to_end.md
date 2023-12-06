---
sidebar_position: 4
---

# 端到端示例

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

我们在存储库中包含了使用LlamaIndex.TS的几个端到端示例

请查看下面的示例，或者尝试使用Dev-Docs提供的交互式Github Codespace教程，在几分钟内完成它们 [这里](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [聊天引擎 (ChatEngine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

读取文件并与 LLM 进行聊天。

## [向量索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

创建一个向量索引并对其进行查询。向量索引将使用嵌入来获取最相关的前k个节点。默认情况下，k的值为2。

## [摘要索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

创建一个列表索引并查询它。这个示例还使用了`LLMRetriever`，它将使用LLM来选择在生成答案时使用的最佳节点。

## [保存/加载索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

创建并加载一个向量索引。一旦创建了存储上下文对象，LlamaIndex.TS会自动将数据持久化到磁盘中。

## [自定义向量索引](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

创建一个向量索引并对其进行查询，同时配置`LLM`、`ServiceContext`和`similarity_top_k`。

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

创建一个OpenAI LLM并直接用于聊天。

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

创建一个Llama-2 LLM，并直接用于聊天。

## [子查询引擎 (SubQuestionQueryEngine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

使用`子查询引擎 (SubQuestionQueryEngine)`，将复杂的查询拆分为多个子问题，然后在所有子问题的答案中聚合响应。

## [低级模块](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

这个示例使用了几个低级组件，它们可以替代实际的查询引擎。这些组件可以在任何应用程序中使用，也可以根据自己的需求进行定制和子类化。
