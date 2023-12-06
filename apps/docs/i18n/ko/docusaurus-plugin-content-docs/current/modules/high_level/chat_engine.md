---
sidebar_position: 4
---

# 채팅 엔진 (ChatEngine)

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

채팅 엔진은 인덱스 내의 데이터와 채팅하는 빠르고 간단한 방법입니다.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// 채팅 시작
const response = await chatEngine.chat(query);
```

## API 참조

- [ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)
