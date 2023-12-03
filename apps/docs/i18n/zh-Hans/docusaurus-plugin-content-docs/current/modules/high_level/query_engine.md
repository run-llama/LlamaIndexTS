---
sidebar_position: 3
---

# 查询引擎 (QueryEngine)

查询引擎将一个`Retriever`和一个`ResponseSynthesizer`封装成一个流水线，该流水线将使用查询字符串来获取节点，然后将它们发送到LLM以生成响应。

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("查询字符串");
```

## 子问题查询引擎 (Sub Question Query Engine)

子问题查询引擎的基本概念是将单个查询分割成多个查询，为每个查询获取答案，然后将这些不同的答案合并成一个为用户提供的连贯响应。你可以将其视为“逐步思考”提示技术，但是在你的数据源上进行迭代！

### 入门

开始尝试子问题查询引擎最简单的方法是运行[examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)中的subquestion.ts文件。

```bash
npx ts-node subquestion.ts
```

### 工具 (Tools)

SubQuestionQueryEngine是通过工具（Tools）来实现的。工具的基本思想是它们是大型语言模型的可执行选项。在这种情况下，我们的SubQuestionQueryEngine依赖于QueryEngineTool，正如你猜到的，它是一个在查询引擎上运行查询的工具。这使我们能够给模型一个选项，例如，为不同的问题查询不同的文档。你也可以想象，SubQuestionQueryEngine可能使用一个工具在网上搜索某些东西，或者使用Wolfram Alpha获取答案。

你可以通过查看LlamaIndex Python文档了解更多关于工具的信息 https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API 参考

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
