---
sidebar_position: 5
---

# 환경

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

LlamaIndex는 현재 공식적으로 NodeJS 18과 NodeJS 20을 지원합니다.

## NextJS 앱 라우터

NextJS 앱 라우터 라우트 핸들러/서버리스 함수를 사용하는 경우, NodeJS 모드를 사용해야합니다:

```js
export const runtime = "nodejs"; // 기본값
```
