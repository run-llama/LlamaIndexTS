---
sidebar_position: 5
---

# 檢索器 (Retriever)

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

在 LlamaIndex 中，檢索器用於使用查詢字串從索引中提取 `Node`。`VectorIndexRetriever` 將提取前 k 個最相似的節點。而 `SummaryIndexRetriever` 則將提取所有節點，無論查詢如何。

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// 提取節點！
const nodesWithScore = await retriever.retrieve("查詢字串");
```

## API 參考

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
