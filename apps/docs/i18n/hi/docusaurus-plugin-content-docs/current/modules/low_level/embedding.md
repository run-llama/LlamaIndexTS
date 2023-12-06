---
sidebar_position: 1
---

# एम्बेडिंग (Embedding)

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

LlamaIndex में एम्बेडिंग मॉडल टेक्स्ट के संख्यात्मक प्रतिनिधित्व बनाने के लिए जिम्मेदार है। डिफ़ॉल्ट रूप से, LlamaIndex `text-embedding-ada-002` मॉडल का उपयोग करेगा जो OpenAI से है।

इसे `ServiceContext` ऑब्जेक्ट में स्पष्ट रूप से सेट किया जा सकता है।

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API संदर्भ

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
