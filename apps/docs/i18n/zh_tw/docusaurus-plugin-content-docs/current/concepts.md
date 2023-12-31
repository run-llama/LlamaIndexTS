---
sidebar_position: 3
---

# 高级概念

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

LlamaIndex.TS 帮助您构建基于自定义数据的 LLM 引擎应用程序（例如问答系统、聊天机器人）。

在这个高级概念指南中，您将学习到：

- 如何使用 LLM 回答问题，利用您自己的数据。
- LlamaIndex.TS 中用于组合自己的查询流程的关键概念和模块。

## 跨数据回答问题

LlamaIndex 在使用 LLM 与您的数据时采用了两个阶段的方法：

1. **索引阶段**：准备知识库，
2. **查询阶段**：从知识库中检索相关上下文，以帮助 LLM 回答问题。

![](./_static/concepts/rag.jpg)

这个过程也被称为检索增强生成（RAG）。

LlamaIndex.TS 提供了必要的工具包，使这两个步骤变得非常简单。

让我们详细了解每个阶段。

### 索引階段

LlamaIndex.TS 通過一套數據連接器和索引幫助您準備知識庫。

![](./_static/concepts/indexing.jpg)

[**數據加載器**](./modules/high_level/data_loader.md)：
數據連接器（即 `Reader`）從不同的數據源和數據格式中提取數據，並將其轉換為簡單的 `Document` 表示（文本和簡單的元數據）。

[**文檔 / 節點**](./modules/high_level/documents_and_nodes.md)：`Document` 是一個通用的容器，用於包裝任何數據源 - 例如 PDF、API 輸出或從數據庫檢索的數據。`Node` 是 LlamaIndex 中的數據原子單位，表示源 `Document` 的一個“塊”。它是一個豐富的表示，包括元數據和關係（與其他節點的關係），以實現準確和表達豐富的檢索操作。

[**數據索引**](./modules/high_level/data_index.md)：
在將數據加載完畢後，LlamaIndex 幫助您將數據索引到易於檢索的格式中。

在內部，LlamaIndex 將原始文檔解析為中間表示，計算向量嵌入，並將數據存儲在內存或磁盤中。

### 查询阶段

在查询阶段，查询流程根据用户的查询检索最相关的上下文，并将其传递给 LLM（连同查询），以合成一个回答。

这使得 LLM 具有最新的知识，而这些知识不在其原始训练数据中，
（同时减少了虚构）。

查询阶段的关键挑战是在（可能很多）知识库上进行检索、编排和推理。

LlamaIndex 提供了可组合的模块，帮助您构建和集成用于问答（查询引擎）、聊天机器人（聊天引擎）或作为代理的 RAG 流程。

这些构建模块可以根据排名偏好进行自定义，并以结构化方式组合以推理多个知识库。

![](./_static/concepts/querying.jpg)

#### 构建模块

[**检索器**](./modules/low_level/retriever.md)：
检索器定义了如何在给定查询时从知识库（即索引）中高效地检索相关上下文。
具体的检索逻辑因索引的不同而异，最流行的是针对向量索引的密集检索。

[**响应合成器**](./modules/low_level/response_synthesizer.md)：
响应合成器使用用户查询和一组检索到的文本块从 LLM 生成回答。

"

#### 流程

[**查询引擎**](./modules/high_level/query_engine.md)：
查询引擎是一个端到端的流程，允许您对数据进行提问。
它接收一个自然语言查询，并返回一个回答，以及检索到的参考上下文传递给 LLM。

[**聊天引擎**](./modules/high_level/chat_engine.md)：
聊天引擎是一个端到端的流程，用于与数据进行对话
（而不仅仅是单个问题和答案）。

"
