---
sidebar_position: 4
---

# Uçtan Uca Örnekler

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

Depoda LlamaIndex.TS kullanarak birkaç uçtan uca örnek bulunmaktadır.

Aşağıdaki örnekleri inceleyin veya onları deneyin ve kendi ihtiyaçlarınıza uyacak şekilde özelleştirilebilen interaktif Github Codespace öğreticileriyle dakikalar içinde tamamlayın. Dev-Docs tarafından sağlanan öğreticilere [buradan](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json) erişebilirsiniz:

## [Sohbet Motoru](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Bir dosyayı okuyun ve LLM ile ilgili sohbet edin.

## [Vektör İndeksi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Bir vektör indeksi oluşturun ve sorgulayın. Vektör indeksi, en ilgili k en üst düğümü getirmek için gömme kullanacaktır. Varsayılan olarak, k değeri 2'dir.

"

## [Özet İndeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Bir liste indeksi oluşturun ve sorgulayın. Bu örnek ayrıca yanıt üretirken kullanılacak en iyi düğümleri seçmek için `LLMRetriever`'ı da kullanır.

"

## [Bir İndeks Kaydet / Yükle](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Bir vektör indeksi oluşturun ve yükleyin. LlamaIndex.TS'de depolama bağlamı nesnesi oluşturulduğunda diskte kalıcılık otomatik olarak gerçekleşir.

"

## [Özelleştirilmiş Vektör İndeksi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Bir vektör indeksi oluşturun ve sorgulayın, aynı zamanda `LLM`, `ServiceContext` ve `similarity_top_k`'yi yapılandırın.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Bir OpenAI LLM oluşturun ve doğrudan sohbet için kullanın.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Bir Llama-2 LLM oluşturun ve doğrudan sohbet için kullanın.

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Karmaşık sorguları birden fazla alt soruya bölen ve ardından tüm alt soruların cevaplarına göre bir yanıt toplayan `SubQuestionQueryEngine` kullanır.

"

## [Düşük Seviye Modüller](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Bu örnek, gerçek bir sorgu motoruna ihtiyaç duymadan birkaç düşük seviye bileşen kullanır. Bu bileşenler herhangi bir uygulamada veya ihtiyaçlarınıza uyacak şekilde özelleştirilebilir ve alt sınıflandırılabilir.

"
