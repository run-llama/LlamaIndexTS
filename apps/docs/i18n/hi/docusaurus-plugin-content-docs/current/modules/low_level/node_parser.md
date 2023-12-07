---
sidebar_position: 3
---

# नोडपार्सर (NodeParser)

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

`लामा इंडेक्स (LlamaIndex)` में `नोडपार्सर (NodeParser)` `डॉक्यूमेंट (Document)` ऑब्जेक्ट को और संचालनीय `नोड (Node)` ऑब्जेक्ट में विभाजित करने के लिए जिम्मेदार है। जब आप `.fromDocuments()` को कॉल करते हैं, तो `सर्विस कॉन्टेक्स्ट (ServiceContext)` के `नोडपार्सर (NodeParser)` का उपयोग आपके लिए यह स्वचालित रूप से करता है। वैकल्पिक रूप से, आप इसे समय से पहले डॉक्यूमेंट को विभाजित करने के लिए उपयोग कर सकते हैं।

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "मैं 10 साल का हूँ। जॉन 20 साल का है।" }),
]);
```

## TextSplitter (टेक्स्टस्प्लिटर)

आंतरजालीय पाठ विभाजक पाठ को वाक्यों में विभाजित करेगा। यह केवल रॉ टेक्स्ट को विभाजित करने के लिए एक स्वतंत्र मॉड्यूल के रूप में भी उपयोग किया जा सकता है।

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("नमस्ते दुनिया");
```

"

## एपीआई संदर्भ (API Reference)

- [सिम्पलनोडपार्सर (SimpleNodeParser)](../../api/classes/SimpleNodeParser.md)
- [सेंटेंसस्प्लिटर (SentenceSplitter)](../../api/classes/SentenceSplitter.md)

"
