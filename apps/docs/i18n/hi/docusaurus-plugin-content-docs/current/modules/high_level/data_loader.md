---
sidebar_position: 1
---

# रीडर / लोडर

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

LlamaIndex.TS `SimpleDirectoryReader` कक्षा का उपयोग करके फ़ोल्डर से आसानी से फ़ाइलों को लोड करने का समर्थन करता है। वर्तमान में, `.txt`, `.pdf`, `.csv`, `.md` और `.docx` फ़ाइलें समर्थित हैं, और भविष्य में और भी अधिक समर्थित होंगी!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## एपीआई संदर्भ

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
