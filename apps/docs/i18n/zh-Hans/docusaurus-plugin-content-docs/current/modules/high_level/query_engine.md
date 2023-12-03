---
sidebar_position: 3
---

# 查询引擎

查询引擎将`Retriever`和`ResponseSynthesizer`封装成一个流水线，该流水线将使用查询字符串来获取节点，然后将它们发送到LLM以生成响应。

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("query string");
```

## 子问题查询引擎

子问题查询引擎的基本概念是将单个查询拆分为多个查询，为每个查询获取答案，然后将这些不同的答案合并为用户的一个连贯的响应。您可以将其视为“逐步思考”提示技术，但要迭代您的数据源！

### 入门

尝试使用子问题查询引擎的最简单方法是运行[examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)中的subquestion.ts文件。

```bash
npx ts-node subquestion.ts
```

### 工具

子问题查询引擎是使用工具实现的。工具的基本概念是它们是大型语言模型的可执行选项。在这种情况下，我们的子问题查询引擎依赖于QueryEngineTool，正如您猜到的那样，它是用于在查询引擎上运行查询的工具。这使我们能够为不同的问题查询不同的文档，例如。您还可以想象，子问题查询引擎可以使用一个在网络上搜索内容或使用Wolfram Alpha获取答案的工具。

您可以通过查看LlamaIndex Python文档来了解有关工具的更多信息 https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API 参考

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
