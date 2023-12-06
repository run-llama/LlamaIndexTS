---
sidebar_position: 1
---

# Okuyucu / Yükleyici

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LlamaIndex.TS, `SimpleDirectoryReader` sınıfını kullanarak klasörlerden dosyaların kolayca yüklenmesini destekler. Şu anda `.txt`, `.pdf`, `.csv`, `.md` ve `.docx` dosyaları desteklenmektedir ve gelecekte daha fazlası planlanmaktadır!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Referansı

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
