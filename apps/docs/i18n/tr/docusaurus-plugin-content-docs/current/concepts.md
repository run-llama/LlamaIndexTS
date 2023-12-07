---
sidebar_position: 3
---

# Yüksek Düzeyli Kavramlar

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LlamaIndex.TS, özel veriler üzerinde LLM destekli uygulamalar (örneğin, soru-cevap, sohbet botu) oluşturmanıza yardımcı olur.

Bu yüksek düzeyli kavramlar rehberinde aşağıdakileri öğreneceksiniz:

- LLM'in kendi verilerinizi kullanarak soruları nasıl yanıtlayabileceği.
- Kendi sorgu boru hattınızı oluşturmak için LlamaIndex.TS'deki temel kavramlar ve modüller.

## Verileriniz Üzerinde Soruları Yanıtlama

LlamaIndex, verilerinizle bir LLM kullanırken iki aşamalı bir yöntem kullanır:

1. **indeksleme aşaması**: bir bilgi tabanını hazırlama ve
2. **sorgulama aşaması**: bir soruya yanıt vermek için LLM'e yardımcı olacak ilgili bağlamı bilgiden almak

![](./_static/concepts/rag.jpg)

Bu süreç aynı zamanda Retrieval Augmented Generation (RAG) olarak da bilinir.

LlamaIndex.TS, her iki adımı da son derece kolay hale getiren temel araç setini sağlar.

Her aşamayı detaylı olarak inceleyelim.

### İndeksleme Aşaması

LlamaIndex.TS, veri bağlantı noktaları ve indeksler için bir dizi veri bağlayıcı ve indeksleme aracıyla bilgi tabanını hazırlamanıza yardımcı olur.

![](./_static/concepts/indexing.jpg)

[**Veri Yükleyicileri**](./modules/high_level/data_loader.md):
Bir veri bağlayıcısı (örneğin, `Reader`), farklı veri kaynaklarından ve veri formatlarından basit bir `Document` temsiline (metin ve basit meta veri) veri alır.

[**Belgeler / Düğümler**](./modules/high_level/documents_and_nodes.md): Bir `Document`, herhangi bir veri kaynağı etrafında genel bir konteynerdir - örneğin, bir PDF, bir API çıktısı veya bir veritabanından alınan veriler. Bir `Node`, LlamaIndex'deki verinin atomik bir birimidir ve bir kaynak `Document`'in bir "parçasını" temsil eder. Doğru ve açıklayıcı alım işlemlerini mümkün kılmak için meta verileri ve ilişkileri (diğer düğümlere) içeren zengin bir temsil içerir.

[**Veri İndeksleri**](./modules/high_level/data_index.md):
Verilerinizi içe aktardıktan sonra, LlamaIndex verilerinizi kolayca alınabilir bir formata dönüştürmenize yardımcı olur.

LlamaIndex, arka planda ham belgeleri ara temsillere ayrıştırır, vektör gömlemelerini hesaplar ve verilerinizi bellekte veya diske depolar.

"

### Sorgulama Aşaması

Sorgulama aşamasında, sorgu boru hattı, bir kullanıcı sorgusu verildiğinde en uygun bağlamı alır
ve bunu LLM'ye (sorgu ile birlikte) bir yanıt sentezlemek için iletilir.

Bu, LLM'in orijinal eğitim verilerinde olmayan güncel bilgilere sahip olmasını sağlar
(ayrıca hayal ürünü azaltır).

Sorgulama aşamasındaki temel zorluk, (potansiyel olarak birçok) bilgi tabanı üzerinde geri alma, düzenleme ve akıl yürütmedir.

LlamaIndex, soru-cevap (sorgu motoru), sohbet botu (sohbet motoru) veya bir ajanın bir parçası olarak RAG boru hatları oluşturmanıza yardımcı olan birleştirilebilir modüller sağlar.

Bu yapı blokları, sıralama tercihlerini yansıtmak ve yapılandırılmış bir şekilde birden fazla bilgi tabanı üzerinde akıl yürütmek için özelleştirilebilir.

![](./_static/concepts/querying.jpg)

#### Yapı Taşları

[**Geri Alıcılar**](./modules/low_level/retriever.md):
Bir geri alıcı, bir sorgu verildiğinde (yani indeks) bir bilgi tabanından ilgili bağlamı nasıl verimli bir şekilde alacağını tanımlar.
Belirli geri alma mantığı, farklı indeksler için farklılık gösterir ve en popüler olanı vektör indeksi karşısında yoğun geri alma işlemidir.

[**Yanıt Sentezleyiciler**](./modules/low_level/response_synthesizer.md):
Bir yanıt sentezleyici, bir LLM'den bir yanıt üretir ve bunun için bir kullanıcı sorgusu ve alınan metin parçalarının belirli bir kümesi kullanılır.

"

#### Boru Hatları

[**Sorgu Motorları**](./modules/high_level/query_engine.md):
Bir sorgu motoru, verileriniz üzerinde soru sormak için uçtan uca bir boru hattıdır.
Doğal dil sorgusu alır ve bir yanıt ile birlikte LLM'ye iletilen referans bağlamını döndürür.

[**Sohbet Motorları**](./modules/high_level/chat_engine.md):
Bir sohbet motoru, tek bir soru ve cevap yerine verilerinizle bir konuşma yapmak için uçtan uca bir boru hattıdır.

"
