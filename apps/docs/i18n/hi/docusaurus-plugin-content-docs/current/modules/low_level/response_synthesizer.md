---
sidebar_position: 6
---

# रिस्पॉन्स सिंथेसाइज़र (ResponseSynthesizer)

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

रिस्पॉन्स सिंथेसाइज़र जवाब उत्पन्न करने के लिए क्वेरी, नोड और प्रॉम्प्ट टेम्पलेट को LLM को भेजने के लिए जिम्मेदार है। एक जवाब उत्पन्न करने के लिए कुछ मुख्य मोड हैं:

- `Refine`: प्राप्त पाठ चंक के माध्यम से एक उत्तर "बनाएं और संशोधित करें"।
  इसमें प्रत्येक प्राप्त नोड के लिए एक अलग LLM कॉल होती है। अधिक विस्तृत उत्तरों के लिए अच्छा है।
- `CompactAndRefine` (डिफ़ॉल्ट): प्रत्येक LLM कॉल के दौरान प्रॉम्प्ट को "संक्षेपित" करें और अधिकतम प्रॉम्प्ट साइज़ के भीतर फिट होने वाले पाठ चंकों को भरें। यदि एक प्रॉम्प्ट में बहुत सारे चंक होते हैं, तो "बनाएं और संशोधित करें" के द्वारा एक उत्तर बनाएं और जांचें
  कई संक्षेपित प्रॉम्प्ट के माध्यम से। `Refine` के समान है, लेकिन कम LLM कॉल के परिणामस्वरूप होना चाहिए।
- `TreeSummarize`: एक सेट के साथ पाठ चंकों और क्वेरी द्वारा, एक पेड़ का निर्माण करें
  और मूल नोड को उत्तर के रूप में लौटाएं। संक्षेपण के उद्देश्यों के लिए अच्छा है।
- `SimpleResponseBuilder`: एक सेट के साथ पाठ चंकों और क्वेरी द्वारा, प्रत्येक पाठ को लागू करें
  चंक जबकि प्रतिक्रियाएँ एक एरे में जमा होती हैं। सभी की एक संयुक्त स्ट्रिंग लौटाता है
  प्रतिक्रियाओं के लिए। हर पाठ के लिए अलग से क्वेरी चलाने की जरूरत होने पर अच्छा है।

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "मैं 10 साल का हूँ।" }),
    score: 1,
  },
  {
    node: new TextNode({ text: "जॉन 20 साल का है।" }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "मैं कितने साल का हूँ?",
  nodesWithScore,
);
console.log(response.response);
```

## एपीआई संदर्भ

- [रिस्पॉन्स सिंथेसाइज़र (ResponseSynthesizer)](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
