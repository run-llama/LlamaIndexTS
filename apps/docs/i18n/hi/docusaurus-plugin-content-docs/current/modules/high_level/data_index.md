---
sidebar_position: 2
---

# सूचकांक

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

एक सूचकांक आपके डेटा के लिए मूल आपूर्ति और संगठन है। LlamaIndex.TS दो सूचकांकों का समर्थन करता है:

- `VectorStoreIndex` - जब एक प्रतिक्रिया उत्पन्न करने के लिए LLM को शीर्ष-k `नोड` भेजेगा। डिफ़ॉल्ट शीर्ष-k 2 है।
- `SummaryIndex` - प्रतिक्रिया उत्पन्न करने के लिए LLM को सूचकांक में हर `नोड` भेजेगा।

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "परीक्षण" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## एपीआई संदर्भ

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
