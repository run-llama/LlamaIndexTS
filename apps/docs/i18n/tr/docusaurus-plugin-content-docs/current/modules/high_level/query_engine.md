---
sidebar_position: 3
---

# QueryEngine

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

Bir sorgu motoru, bir `Retriever` ve bir `ResponseSynthesizer`'ı bir boru hattına sarar ve sorgu dizesini kullanarak düğümleri alır ve ardından yanıt oluşturmak için LLM'ye gönderir.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("sorgu dizesi");
```

## Alt Soru Sorgu Motoru

Alt Soru Sorgu Motoru'nun temel konsepti, tek bir sorguyu birden çok sorguya bölmek, her bir sorgu için bir yanıt almak ve ardından bu farklı yanıtları kullanıcının anlayabileceği tek bir tutarlı yanıta birleştirmektir. Veri kaynaklarınızı teker teker gözden geçirerek "bu adım adım düşün" yöntemini düşünebilirsiniz!

### Başlarken

Alt Soru Sorgu Motoru'nu denemeye başlamanın en kolay yolu, [örnekler](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts) klasöründe bulunan subquestion.ts dosyasını çalıştırmaktır.

```bash
npx ts-node subquestion.ts
```

"

### Araçlar

SubQuestionQueryEngine, Araçlar ile uygulanır. Araçların temel fikri, büyük dil modeli için yürütülebilir seçenekler olmalarıdır. Bu durumda, SubQuestionQueryEngine'imiz, sorgu motorunda sorguları çalıştırmak için bir QueryEngineTool'a dayanır. Bu, modelin farklı sorular için farklı belgelere sorgu yapma seçeneği sunmamızı sağlar. Ayrıca, SubQuestionQueryEngine'in web'de bir şey arayan veya Wolfram Alpha'yı kullanarak bir yanıt alan bir Araç kullanabileceğini hayal edebilirsiniz.

Araçlar hakkında daha fazla bilgi için LlamaIndex Python belgelerine göz atabilirsiniz: https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## API Referansı

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
