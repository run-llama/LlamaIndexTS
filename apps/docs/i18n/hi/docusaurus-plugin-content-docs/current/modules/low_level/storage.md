---
sidebar_position: 7
---

# संग्रहण (Storage)

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

LlamaIndex.TS में संग्रहण स्वचालित रूप से काम करता है जब आपने एक `StorageContext` ऑब्जेक्ट कॉन्फ़िगर कर लिया हो। बस `persistDir` को कॉन्फ़िगर करें और इसे एक इंडेक्स से जोड़ें।

वर्तमान में, केवल डिस्क से सहेजना और लोड करना समर्थित है, भविष्य की एकीकरण योजनाएं हैं!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "परीक्षण पाठ" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API संदर्भ

- [संग्रहण संदर्भ (StorageContext)](../../api/interfaces/StorageContext.md)

"
