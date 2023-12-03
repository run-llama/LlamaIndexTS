---
sidebar_position: 3
---

# 查询引擎 (QueryEngine)

查询引擎将 `Retriever` 和 `ResponseSynthesizer` 封装成一个流水线，该流水线将使用查询字符串来获取节点，然后将它们发送到 LLM 以生成响应。

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("query string");
```

## 子问题查询引擎 (Sub Question Query Engine)

子问题查询引擎的基本概念是将单个查询拆分为多个查询，为每个查询获取答案，然后将这些不同的答案合并为用户的一个连贯的响应。您可以将其视为“逐步思考”提示技术，但是在数据源上进行迭代！

### 入门指南

尝试使用子问题查询引擎的最简单方法是运行 [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts) 中的 subquestion.ts 文件。

```bash
npx ts-node subquestion.ts
```

### 工具 (Tools)

子问题查询引擎是使用工具 (Tools) 实现的。工具的基本概念是它们是大型语言模型的可执行选项。在这种情况下，我们的子问题查询引擎依赖于 QueryEngineTool，正如您猜到的那样，它是用于在查询引擎上运行查询的工具。这使我们能够为模型提供一个选项，例如为不同的问题查询不同的文档。您还可以想象，子问题查询引擎可以使用一个在网络上搜索内容或使用 Wolfram Alpha 获取答案的工具。

您可以通过查看 LlamaIndex Python 文档 https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html 了解更多关于工具的信息。

## API 参考

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
