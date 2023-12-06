# Temel Modüller

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LlamaIndex.TS, hızlı başlamanız için yüksek seviyeli modüllere ve ihtiyaçlarınıza göre özelleştirebileceğiniz düşük seviyeli modüllere ayrılmış birkaç temel modül sunar.

## Yüksek Seviyeli Modüller

- [**Belge**](./high_level/documents_and_nodes.md): Bir belge, bir metin dosyası, PDF dosyası veya diğer sürekli veri parçalarını temsil eder.

- [**Düğüm**](./high_level/documents_and_nodes.md): Temel veri birimidir. Genellikle, bunlar, belgenin yönetilebilir parçalara bölünmüş olan ve bir gömme modeline ve LLM'ye beslemek için yeterince küçük olan parçalardır.

- [**Okuyucu/Yükleyici**](./high_level/data_loader.md): Bir okuyucu veya yükleyici, gerçek dünyada bir belgeyi alır ve bir Belge sınıfına dönüştürerek İndeks ve sorgularınızda kullanılabilir hale getirir. Şu anda düz metin dosyalarını ve PDF'leri destekliyoruz ve daha birçok formata destek eklemeye devam ediyoruz.

- [**İndeksler**](./high_level/data_index.md): İndeksler, Düğümleri ve bu düğümlerin gömülerini depolar.

- [**Sorgu Motoru**](./high_level/query_engine.md): Sorgu motorları, girdiğiniz sorguyu oluşturan ve sonucu size veren şeylerdir. Sorgu motorları genellikle, LLM'nin sorgunuzu yanıtlamak için ihtiyaç duyduğu bağlamı sağlamak için önceden oluşturulmuş bir ipucuyla İndeksinizden seçilen düğümleri birleştirir.

- [**Sohbet Motoru**](./high_level/chat_engine.md): Bir Sohbet Motoru, İndekslerinizle etkileşimde bulunacak bir sohbet botu oluşturmanıza yardımcı olur.

## Düşük Seviyeli Modül

- [**LLM**](./low_level/llm.md): LLM sınıfı, OpenAI GPT-4, Anthropic Claude veya Meta LLaMA gibi büyük bir dil modeli sağlayıcısı üzerinde birleşik bir arayüz sağlar. Kendi büyük dil modelinize bir bağlayıcı yazmak için bunu alt sınıf olarak kullanabilirsiniz.

- [**Gömme**](./low_level/embedding.md): Bir gömme, kayan nokta sayılarının bir vektörü olarak temsil edilir. OpenAI'nin varsayılan gömme modeli olan text-embedding-ada-002, her bir gömme için 1.536 kayan nokta sayısı içerir. Başka popüler bir gömme modeli ise her bir Düğümü temsil etmek için 768 kayan nokta sayısı kullanan BERT'tir. Gömme ile çalışmak için 3 benzerlik hesaplama seçeneği ve Maksimum Marjinal Önem dahil bir dizi yardımcı program sağlıyoruz.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Metin bölme stratejileri, gömme aramasının genel etkinliği için son derece önemlidir. Şu anda bir varsayılanımız olsa da, herkesin kullanabileceği tek bir çözüm yoktur. Kaynak belgelere bağlı olarak farklı bölme boyutları ve stratejileri kullanmak isteyebilirsiniz. Şu anda sabit boyuta göre bölme, örtüşen bölümlerle sabit boyuta göre bölme, cümlelere göre bölme ve paragraflara göre bölme gibi bölme yöntemlerini destekliyoruz. Metin bölücü, `Belge`leri `Düğüm`lere bölerken NodeParser tarafından kullanılır.

- [**Retriever**](./low_level/retriever.md): Retriever, dizinden alınacak Düğümleri gerçekten seçen bileşendir. Burada, her sorgu için daha fazla veya daha az Düğüm almayı deneyebilir, benzerlik fonksiyonunuzu değiştirebilir veya uygulamanızdaki her bir özel kullanım durumu için kendi retriever'ınızı oluşturabilirsiniz. Örneğin, kod içeriği ile metin içeriği için ayrı bir retriever'a sahip olmak isteyebilirsiniz.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer, bir sorgu dizesini alır ve bir `Düğüm` listesini kullanarak bir yanıt oluşturur. Bu, bir yanıtı tüm bağlam üzerinde dolaşarak iyileştirme veya özetlerin bir ağacını oluşturarak kök özeti döndürme gibi birçok şekilde gerçekleştirilebilir.

- [**Depolama**](./low_level/storage.md): Bir noktada dizinlerinizi, verilerinizi ve vektörlerinizi her seferinde gömme modellerini yeniden çalıştırmak yerine depolamak isteyeceksiniz. IndexStore, DocStore, VectorStore ve KVStore, bunu yapmanıza izin veren soyutlamalardır. Birleşerek StorageContext'i oluştururlar. Şu anda, gömlemelerinizi dosyalarda (veya sanal bellekteki bir dosya sisteminde) saklamanıza izin veriyoruz, ancak Vector Veritabanlarına entegrasyonlar eklemeye de aktif olarak çalışıyoruz.
