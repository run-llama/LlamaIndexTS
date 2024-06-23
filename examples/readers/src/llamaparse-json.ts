import {
  Document,
  ImageNode,
  LlamaParseReader,
  OpenAI,
  VectorStoreIndex,
} from "llamaindex";
import { createMessageContent } from "llamaindex/synthesizers/utils";

const reader = new LlamaParseReader();
async function main() {
  // Load PDF using LlamaParse JSON mode and return an array of json objects
  const jsonObjs = await reader.loadJson("../data/uber_10q_march_2022.pdf");
  // Access the first "pages" (=a single parsed file) object in the array
  const jsonList = jsonObjs[0]["pages"];

  const textDocs = getTextDocs(jsonList);
  const imageTextDocs = await getImageTextDocs(jsonObjs);
  const documents = [...textDocs, ...imageTextDocs];
  // Split text, create embeddings and query the index
  const index = await VectorStoreIndex.fromDocuments(documents);
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query:
      "What does the bar graph titled 'Monthly Active Platform Consumers' show?",
  });

  console.log(response.toString());
}

main().catch(console.error);

// Extract and assign text and page number from jsonList, return an array of Document objects
function getTextDocs(jsonList: { text: string; page: number }[]): Document[] {
  return jsonList.map(
    (page) => new Document({ text: page.text, metadata: { page: page.page } }),
  );
}
// Download all images from jsonObjs, send them to OpenAI API to get alt text, return an array of Document objects
async function getImageTextDocs(jsonObjs: any): Promise<Document[]> {
  const llm = new OpenAI({
    model: "gpt-4o",
    temperature: 0.2,
    maxTokens: 1000,
  });
  const imageDicts = await reader.getImages(jsonObjs, "images");
  const imageDocs = [];

  for (const imageDict of imageDicts) {
    const imageDoc = new ImageNode({ image: imageDict.path });
    const prompt = () => `Describe the image as alt text`;
    const message = await createMessageContent(prompt, [imageDoc]);

    const response = await llm.complete({
      prompt: message,
    });

    const doc = new Document({
      text: response.text,
      metadata: { path: imageDict.path },
    });
    imageDocs.push(doc);
  }

  return imageDocs;
}
