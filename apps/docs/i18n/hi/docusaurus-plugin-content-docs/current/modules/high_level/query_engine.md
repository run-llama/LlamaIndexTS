---
sidebar_position: 3
---

# क्वेरी इंजन (QueryEngine)

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

क्वेरी इंजन एक `Retriever` और एक `ResponseSynthesizer` को एक पाइपलाइन में बांधता है, जो क्वेरी स्ट्रिंग का उपयोग करके नोड्स को प्राप्त करेगा और फिर उन्हें LLM को भेजेगा ताकि एक प्रतिक्रिया उत्पन्न की जा सके।

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("query string");
```

## सब प्रश्न क्वेरी इंजन (Sub Question Query Engine)

सब प्रश्न क्वेरी इंजन की मूल अवधारणा यह है कि यह एक एकल क्वेरी को एकाधिक क्वेरी में विभाजित करता है, प्रत्येक क्वेरी के लिए एक उत्तर प्राप्त करता है, और फिर उन विभिन्न उत्तरों को एक संगठित प्रतिक्रिया में जोड़ता है जो उपयोगकर्ता के लिए होती है। आप इसे "इसे चरण-चरण सोचें" प्रॉम्प्ट तकनीक के रूप में सोच सकते हैं, लेकिन अपने डेटा स्रोतों पर इटरेशन करते हुए!

### शुरू करना

सब प्रश्न क्वेरी इंजन को आजमाने का सबसे आसान तरीका [उदाहरणों](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts) में subquestion.ts फ़ाइल को चलाना है।

```bash
npx ts-node subquestion.ts
```

### उपकरण (Tools)

सब प्रश्न क्वेरी इंजन उपकरणों के साथ लागू किया जाता है। उपकरणों की मूल विचारधारा यह है कि वे बड़े भाषा मॉडल के लिए क्रियान्वयन योग्य विकल्प होते हैं। इस मामले में, हमारा सब प्रश्न क्वेरी इंजन QueryEngineTool पर निर्भर करता है, जो कि आपने सोचा होगा कि यह क्वेरी इंजन पर क्वेरी चलाने के लिए एक उपकरण है। इससे हम मॉडल को विभिन्न प्रश्नों के लिए विभिन्न दस्तावेज़ों पर क्वेरी करने का विकल्प दे सकते हैं। आप यह भी कल्पना कर सकते हैं कि सब प्रश्न क्वेरी इंजन वेब पर कुछ खोजता है या Wolfram Alpha का उपयोग करके एक उत्तर प्राप्त करता है के लिए एक उपकरण का उपयोग कर सकता है।

आप LlamaIndex Python दस्तावेज़ीकरण पर जाकर उपकरणों के बारे में और अधिक जान सकते हैं https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## एपीआई संदर्भ (API Reference)

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
