---
sidebar_position: 1
---

# 리더 / 로더

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

LlamaIndex.TS는 `SimpleDirectoryReader` 클래스를 사용하여 폴더에서 파일을 쉽게 로드할 수 있습니다. 현재 `.txt`, `.pdf`, `.csv`, `.md` 및 `.docx` 파일이 지원되며, 앞으로 더 많은 파일 형식이 지원될 예정입니다!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API 참조

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
