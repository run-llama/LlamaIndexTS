---
sidebar_position: 2
---

# 스타터 튜토리얼

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

[LlamaIndex.TS를 NPM을 사용하여 설치](installation)하고 OpenAI 키를 설정한 후, 첫 번째 앱을 시작할 준비가 되었습니다:

새 폴더에서:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # 필요한 경우
```

`example.ts` 파일을 생성하세요. 이 코드는 몇 가지 예제 데이터를 로드하고 문서를 생성한 다음 (OpenAI를 사용하여 임베딩을 생성하는) 색인을 만들고 데이터에 대한 질문에 대답하기 위한 쿼리 엔진을 생성합니다.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Node에서 abramov.txt에서 에세이 로드
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // 에세이로 Document 객체 생성
  const document = new Document({ text: essay });

  // 텍스트를 분할하고 임베딩을 생성하여 VectorStoreIndex에 저장
  const index = await VectorStoreIndex.fromDocuments([document]);

  // 색인에 쿼리
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("저자는 대학에서 무엇을 했나요?");

  // 응답 출력
  console.log(response.toString());
}

main();
```

그런 다음 다음을 사용하여 실행할 수 있습니다.

```bash
npx ts-node example.ts
```

더 알아보려면 https://llama-playground.vercel.app/에서 NextJS 플레이그라운드를 확인하세요. 소스는 https://github.com/run-llama/ts-playground에서 확인할 수 있습니다.

"
