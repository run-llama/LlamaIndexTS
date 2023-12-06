---
sidebar_position: 6
---

# ResponseSynthesizer

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

ResponseSynthesizer, sorguyu, düğümleri ve prompt şablonlarını yanıt üretmek için LLM'ye gönderme işlemini üstlenir. Yanıt üretmek için birkaç temel mod vardır:

- `Refine`: Her alınan metin parçası üzerinden sıralı olarak "yanıt oluştur ve iyileştir" işlemi yapar.
  Bu, her düğüm için ayrı bir LLM çağrısı yapar. Daha detaylı yanıtlar için iyidir.
- `CompactAndRefine` (varsayılan): Her LLM çağrısı sırasında prompt'u "sıkıştırarak" maksimum prompt boyutu içine sığabilecek kadar çok metin parçası ekler.
  Bir prompt içine sığacak kadar çok parça varsa, birden fazla sıkıştırılmış prompt üzerinden "yanıt oluştur ve iyileştir" işlemi yapar. `refine` ile aynıdır, ancak daha az LLM çağrısı yapar.
- `TreeSummarize`: Bir metin parçası kümesi ve sorgu verildiğinde, rekürsif olarak bir ağaç oluşturur ve kök düğümü yanıt olarak döndürür. Özetleme amaçlı iyidir.
- `SimpleResponseBuilder`: Bir metin parçası kümesi ve sorgu verildiğinde, her metin parçasına sorguyu uygulayarak yanıtları bir diziye biriktirir.
  Tüm yanıtların birleştirilmiş bir dizesini döndürür. Her bir metin parçası için ayrı ayrı sorguyu çalıştırmanız gerektiğinde iyidir.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Ben 10 yaşındayım." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John 20 yaşındadır." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Kaç yaşındayım?",
  nodesWithScore,
);
console.log(response.response);
```

## API Referansı

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
