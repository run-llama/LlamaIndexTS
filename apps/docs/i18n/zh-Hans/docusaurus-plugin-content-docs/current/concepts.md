---
sidebar_position: 3
---

# 高级概念

LlamaIndex.TS 帮助您构建基于 LLM 的应用程序（例如问答系统、聊天机器人），并使用自定义数据。

在这个高级概念指南中，您将学到：

- 如何使用 LLM 来回答问题，使用您自己的数据。
- LlamaIndex.TS 中用于组合自己的查询流程的关键概念和模块。

## 跨数据回答问题

LlamaIndex 在使用 LLM 处理您的数据时采用两阶段方法：

1. **索引阶段**：准备知识库，以及
2. **查询阶段**：从知识中检索相关上下文，以帮助 LLM 回答问题

![](./_static/concepts/rag.jpg)

这个过程也被称为检索增强生成（RAG）。

LlamaIndex.TS 提供了必要的工具包，使这两个步骤变得非常容易。

让我们详细探讨每个阶段。

### 索引阶段

LlamaIndex.TS 帮助您使用一套数据连接器和索引准备知识库。

![](./_static/concepts/indexing.jpg)

[**数据加载器**](./modules/high_level/data_loader.md)：
数据连接器（即 `Reader`）从不同的数据源和数据格式中摄取数据，转换为简单的 `Document` 表示（文本和简单元数据）。

[**文档 / 节点**](./modules/high_level/documents_and_nodes.md)：`Document` 是围绕任何数据源的通用容器 - 例如 PDF、API 输出或从数据库中检索的数据。`Node` 是 LlamaIndex 中的数据原子单元，表示源 `Document` 的“块”。它是一个丰富的表示，包括元数据和关系（到其他节点）以实现准确和表达丰富的检索操作。

[**数据索引**](./modules/high_level/data_index.md)：
一旦摄取了数据，LlamaIndex 帮助您将数据索引为易于检索的格式。

在内部，LlamaIndex 将原始文档解析为中间表示，计算向量嵌入，并将数据存储在内存中或磁盘上。

### 查询阶段

在查询阶段，查询流程检索给定用户查询的最相关上下文，并将其传递给 LLM（连同查询），以合成响应。

这为 LLM 提供了不在其原始训练数据中的最新知识（也减少了幻觉）。

查询阶段的关键挑战在于检索、编排和推理（可能是多个）知识库。

LlamaIndex 提供了可组合的模块，帮助您构建和集成用于问答（查询引擎）、聊天机器人（聊天引擎）或作为代理的 RAG 流程。

这些构建模块可以根据排名偏好进行自定义，以及以结构化方式组合推理多个知识库。

![](./_static/concepts/querying.jpg)

#### 构建模块

[**检索器**](./modules/low_level/retriever.md)：
检索器定义了如何在给定查询时从知识库（即索引）中高效检索相关内容。
具体的检索逻辑因索引的不同而异，最流行的是针对向量索引的密集检索。

[**响应合成器**](./modules/low_level/response_synthesizer.md)：
响应合成器使用用户查询和一组检索到的文本片段，从 LLM 生成响应。

#### 流程

[**查询引擎**](./modules/high_level/query_engine.md)：
查询引擎是一个端到端流程，允许您在您的数据上提问。
它接受自然语言查询，并返回一个响应，以及检索并传递给 LLM 的参考上下文。

[**聊天引擎**](./modules/high_level/chat_engine.md)：
聊天引擎是一个端到端流程，用于与您的数据进行对话
（而不是单一的问答，而是多次来回）。

```

```
