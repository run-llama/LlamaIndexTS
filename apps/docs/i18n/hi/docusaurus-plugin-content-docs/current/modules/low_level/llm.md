---
sidebar_position: 0
---

# एलएलएम (LLM)

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

एलएलएम टेक्स्ट को पढ़ने और प्रश्नों के लिए प्राकृतिक भाषा के जवाब उत्पन्न करने के लिए जिम्मेदार है। डिफ़ॉल्ट रूप से, LlamaIndex.TS `gpt-3.5-turbo` का उपयोग करता है।

एलएलएम को `ServiceContext` ऑब्जेक्ट में स्पष्ट रूप से सेट किया जा सकता है।

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## एपीआई संदर्भ

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
