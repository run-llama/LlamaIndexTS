---
sidebar_position: 1
---

`این مستند به طور خودکار ترجمه شده و ممکن است حاوی اشتباهات باشد. در صورت پیشنهاد تغییرات، دریغ نکنید از باز کردن یک Pull Request.`

# خواننده / بارگذار

LlamaIndex.TS از طریق کلاس `SimpleDirectoryReader` بارگذاری آسان فایل ها از پوشه ها را پشتیبانی می کند. در حال حاضر، فایل های `.txt`، `.pdf`، `.csv`، `.md` و `.docx` پشتیبانی می شوند و در آینده بیشتری نیز برنامه ریزی شده است!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## مرجع API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
