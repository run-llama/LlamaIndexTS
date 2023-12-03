---
sidebar_position: 6
---

# 响应合成器 (ResponseSynthesizer)

响应合成器负责将查询、节点和提示模板发送到LLM以生成响应。有几种关键模式用于生成响应：

- `Refine`：通过顺序查看每个检索到的文本块来“创建和完善”答案。这会使每个节点进行单独的LLM调用。适用于更详细的答案。
- `CompactAndRefine`（默认）：在每次LLM调用期间通过填充尽可能多的文本块来“压缩”提示，以适应最大提示大小。如果有太多的文本块无法装入一个提示中，则通过多个紧凑提示“创建和完善”答案。与`Refine`相同，但应减少LLM调用次数。
- `TreeSummarize`：给定一组文本块和查询，递归构造树并将根节点作为响应返回。适用于总结目的。
- `SimpleResponseBuilder`：给定一组文本块和查询，将查询应用于每个文本块，同时将响应累积到数组中。返回所有响应的连接字符串。适用于需要针对每个文本块单独运行相同查询的情况。

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "我今年10岁。" }),
    score: 1,
  },
  {
    node: new TextNode({ text: "约翰今年20岁。" }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "我多大了？",
  nodesWithScore,
);
console.log(response.response);
```

## API 参考

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)
