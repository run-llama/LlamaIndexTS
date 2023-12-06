---
sidebar_position: 5
---

# रिट्रीवर (Retriever)

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

LlamaIndex में एक रिट्रीवर वह होता है जिसका उपयोग क्वेरी स्ट्रिंग का उपयोग करके इंडेक्स से `Node` को प्राप्त करने के लिए किया जाता है। `VectorIndexRetriever` शीर्ष-k सबसे समान नोड्स को प्राप्त करेगा। वहीं, `SummaryIndexRetriever` क्वेरी के बावजूद सभी नोड्स को प्राप्त करेगा।

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// नोड्स प्राप्त करें!
const nodesWithScore = await retriever.retrieve("क्वेरी स्ट्रिंग");
```

## एपीआई संदर्भ (API Reference)

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
