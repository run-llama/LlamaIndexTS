---
sidebar_position: 4
---

# चैट इंजन (ChatEngine)

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

चैट इंजन आपके इंडेक्स में डेटा के साथ चैट करने का एक त्वरित और सरल तरीका है।

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// चैट शुरू करें
const response = await chatEngine.chat(query);
```

## एपीआई संदर्भ

- [ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)
