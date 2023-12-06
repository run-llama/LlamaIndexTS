---
sidebar_position: 7
---

# 저장소 (Storage)

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

LlamaIndex.TS의 저장소는 `StorageContext` 객체를 구성한 후 자동으로 작동합니다. `persistDir`을 구성하고 인덱스에 연결하기만 하면 됩니다.

현재는 디스크에서의 저장 및 로드만 지원되며, 향후 통합이 계획되어 있습니다!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "테스트 텍스트" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API 참조

- [StorageContext](../../api/interfaces/StorageContext.md)

"
