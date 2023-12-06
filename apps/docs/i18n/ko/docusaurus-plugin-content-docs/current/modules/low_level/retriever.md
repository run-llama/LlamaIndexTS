---
sidebar_position: 5
---

# 리트리버 (Retriever)

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

LlamaIndex에서 리트리버는 쿼리 문자열을 사용하여 인덱스에서 `Node`를 가져오는 데 사용되는 도구입니다. `VectorIndexRetriever`는 가장 유사한 상위 k개의 노드를 가져옵니다. 한편, `SummaryIndexRetriever`는 쿼리에 관계없이 모든 노드를 가져옵니다.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// 노드를 가져옵니다!
const nodesWithScore = await retriever.retrieve("쿼리 문자열");
```

## API 참조

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
