---
sidebar_position: 2
---

# Başlangıç Kılavuzu

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

[LlamaIndex.TS'i NPM kullanarak kurduktan](installation) ve OpenAI anahtarınızı ayarladıktan sonra, ilk uygulamanıza başlamaya hazırsınız:

Yeni bir klasörde:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # gerekirse
```

`example.ts` adında bir dosya oluşturun. Bu kod, bazı örnek verileri yükleyecek, bir belge oluşturacak, onu dizine ekleyecek (OpenAI kullanarak gömme oluşturacak) ve ardından veriler hakkında soruları yanıtlayacak bir sorgu motoru oluşturacak.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Node'da abramov.txt dosyasından makale yükle
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Makale ile Document nesnesi oluştur
  const document = new Document({ text: essay });

  // Metni bölecek ve gömme oluşturacak. Bunları VectorStoreIndex içinde sakla
  const index = await VectorStoreIndex.fromDocuments([document]);

  // İndexe sorgu yap
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Yazar üniversitede ne yaptı?");

  // Yanıtı çıktıla
  console.log(response.toString());
}

main();
```

Ardından şunu kullanarak çalıştırabilirsiniz

```bash
npx ts-node example.ts
```

Daha fazlasını öğrenmeye hazır mısınız? NextJS oyun alanımıza göz atın: https://llama-playground.vercel.app/. Kaynak kodu burada bulunabilir: https://github.com/run-llama/ts-playground

"
