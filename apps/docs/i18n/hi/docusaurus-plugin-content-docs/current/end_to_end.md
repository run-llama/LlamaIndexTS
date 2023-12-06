---
sidebar_position: 4
---

# एंड टू एंड उदाहरण

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

हम रिपॉजिटरी में LlamaIndex.TS का उपयोग करके कई एंड टू एंड उदाहरण शामिल करते हैं।

नीचे दिए गए उदाहरणों की जांच करें या उन्हें आज़माएं और इंटरैक्टिव GitHub Codespace ट्यूटोरियल के साथ मिनटों में पूरा करें, जो Dev-Docs द्वारा प्रदान किए जाते हैं [यहां](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [चैट इंजन](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

एक फ़ाइल पढ़ें और LLM के साथ इसके बारे में चैट करें।

## [वेक्टर इंडेक्स](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

एक वेक्टर इंडेक्स बनाएं और इसे क्वेरी करें। वेक्टर इंडेक्स अधिकतम k सबसे संबंधित नोड्स प्राप्त करने के लिए एम्बेडिंग का उपयोग करेगा। डिफ़ॉल्ट रूप से, शीर्ष k 2 होता है।

## [सारांश सूचकांक](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

एक सूचकांक सृजित करें और इसे क्वेरी करें। इस उदाहरण में `LLMRetriever` भी उपयोग किया जाएगा, जो उत्तर उत्पन्न करते समय उपयोग करने के लिए सर्वश्रेष्ठ नोड का चयन करेगा।

"

## [एक इंडेक्स सहेजें / लोड करें](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

एक वेक्टर इंडेक्स बनाएं और लोड करें। LlamaIndex.TS में संग्रह संदर्भ ऑब्जेक्ट बनाने के बाद डिस्क में स्वचालित रूप से सहेजा जाता है।

## [कस्टमाइज़ वेक्टर इंडेक्स](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

एक वेक्टर इंडेक्स बनाएं और इसे क्वेरी करें, साथ ही `LLM`, `ServiceContext`, और `similarity_top_k` को भी कॉन्फ़िगर करें।

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

एक OpenAI LLM बनाएं और सीधे चैट के लिए उसका उपयोग करें।

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

एक Llama-2 LLM बनाएं और सीधे चैट के लिए उसका उपयोग करें।

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

`SubQuestionQueryEngine` का उपयोग करता है, जो जटिल क्वेरी को कई सवालों में विभाजित करता है, और फिर सभी उप-सवालों के जवाबों के साथ एक प्रतिक्रिया को एकत्रित करता है।

"

## [लो लेवल मॉड्यूल](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

इस उदाहरण में कई लो-लेवल कॉम्पोनेंट का उपयोग किया जाता है, जो एक वास्तविक क्वेरी इंजन की आवश्यकता को हटा देता है। ये कॉम्पोनेंट किसी भी एप्लिकेशन में कहीं भी उपयोग किए जा सकते हैं, या आपकी खुद की आवश्यकताओं को पूरा करने के लिए उन्हें अनुकूलित और सब-क्लास किया जा सकता है।

"
