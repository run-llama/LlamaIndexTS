---
sidebar_position: 3
---

# NodeParser

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

`NodeParser`는 LlamaIndex에서 `Document` 객체를 더 작은 `Node` 객체로 분할하는 역할을 담당합니다. `.fromDocuments()`를 호출하면 `ServiceContext`의 `NodeParser`가 자동으로 이 작업을 수행합니다. 또는 문서를 미리 분할하는 데에도 사용할 수 있습니다.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "나는 10살입니다. 존은 20살입니다." }),
]);
```

## TextSplitter

기본 텍스트 분할기는 문장 단위로 텍스트를 분할합니다. 원시 텍스트를 분할하는 독립 모듈로도 사용할 수 있습니다.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("안녕하세요 세상");
```

## API 참조

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
