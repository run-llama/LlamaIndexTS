---
sidebar_position: 2
---

# स्टार्टर ट्यूटोरियल

`इस दस्तावेज़ का अनुवाद स्वचालित रूप से किया गया है और इसमें त्रुटियाँ हो सकती हैं। परिवर्तन सुझाने के लिए पुल रिक्वेस्ट खोलने में संकोच न करें।`

जब आप [NPM का उपयोग करके LlamaIndex.TS को स्थापित](installation) कर लिया हो और अपनी OpenAI कुंजी को सेटअप कर लिया हो, तो आप अपना पहला ऐप शुरू करने के लिए तैयार हैं:

एक नई फ़ोल्डर में:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # यदि आवश्यक हो
```

`example.ts` नामक फ़ाइल बनाएं। यह कोड कुछ उदाहरण डेटा लोड करेगा, एक दस्तावेज़ बनाएगा, इसे इंडेक्स करेगा (जिसमें OpenAI का उपयोग करके embeddings बनाए जाते हैं), और फिर डेटा के बारे में सवालों का उत्तर देने के लिए क्वेरी इंजन बनाएगा।

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // नोड में abramov.txt से निबंध लोड करें
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // निबंध के साथ डॉक्यूमेंट ऑब्जेक्ट बनाएं
  const document = new Document({ text: essay });

  // पाठ को विभाजित करें और embeddings बनाएं। उन्हें एक VectorStoreIndex में संग्रहीत करें
  const index = await VectorStoreIndex.fromDocuments([document]);

  // इंडेक्स पर क्वेरी करें
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("कॉलेज में लेखक ने क्या किया था?");

  // उत्तर को आउटपुट करें
  console.log(response.toString());
}

main();
```

फिर आप इसे निम्नलिखित का उपयोग करके चला सकते हैं

```bash
npx ts-node example.ts
```

और अधिक सीखने के लिए तैयार हैं? हमारे NextJS प्लेग्राउंड को देखें https://llama-playground.vercel.app/. स्रोत उपलब्ध है https://github.com/run-llama/ts-playground
