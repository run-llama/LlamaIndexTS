---
sidebar_position: 6
---

# 响应合成器 (ResponseSynthesizer)

响应合成器负责将查询、节点和提示模板发送到LLM以生成响应。生成响应有几种关键模式：

- `Refine`：通过顺序处理每个检索到的文本块来“创建并完善”答案。
  这会对每个节点进行单独的LLM调用。适合更详细的答案。
- `CompactAndRefine`（默认）：通过在每次LLM调用中“压缩”提示，将尽可能多的文本块塞入最大提示大小内。如果有太多块无法一次性塞入提示中，则通过处理多个压缩提示来“创建并完善”答案。与`refine`相同，但应该会导致更少的LLM调用。
- `TreeSummarize`：给定一组文本块和查询，递归构建一棵树，并返回根节点作为响应。适合总结目的。
- `SimpleResponseBuilder`：给定一组文本块和查询，将查询应用于每个文本块，同时将响应累积到一个数组中。返回所有响应的连接字符串。适用于需要对每个文本块分别运行相同查询的情况。

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
  "我几岁了？",
  nodesWithScore,
);
console.log(response.response);
```

## API 参考

- [响应合成器 (ResponseSynthesizer)](../../api/classes/ResponseSynthesizer.md)
- [精炼 (Refine)](../../api/classes/Refine.md)
- [压缩并精炼 (CompactAndRefine)](../../api/classes/CompactAndRefine.md)
- [树状总结 (TreeSummarize)](../../api/classes/TreeSummarize.md)
- [简单响应构建器 (SimpleResponseBuilder)](../../api/classes/SimpleResponseBuilder.md)
