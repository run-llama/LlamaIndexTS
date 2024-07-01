import { JinaAIEmbedding, similarity, SimilarityType } from "llamaindex";

async function main() {
  const jina = new JinaAIEmbedding({
    model: "jina-clip-v1",
  });

  // Get text embeddings
  const text1 = "a car";
  const textEmbedding1 = await jina.getTextEmbedding(text1);
  const text2 = "a football match";
  const textEmbedding2 = await jina.getTextEmbedding(text2);

  // Get image embedding
  const image =
    "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/football-match.jpg";
  const imageEmbedding = await jina.getImageEmbedding(image);

  // Calc similarity
  const sim1 = similarity(
    textEmbedding1,
    imageEmbedding,
    SimilarityType.DEFAULT,
  );
  const sim2 = similarity(
    textEmbedding2,
    imageEmbedding,
    SimilarityType.DEFAULT,
  );

  console.log(`Similarity between "${text1}" and the image is ${sim1}`);
  console.log(`Similarity between "${text2}" and the image is ${sim2}`);

  // Get multiple text embeddings
  const textEmbeddings = await jina.getTextEmbeddings([text1, text2]);
  console.log(
    "Get multiple text embeddings in a single request",
    textEmbeddings,
  );

  // Get multiple image embeddings
  const catImg1 =
    "https://i.pinimg.com/600x315/21/48/7e/21487e8e0970dd366dafaed6ab25d8d8.jpg";
  const catImg2 =
    "https://i.pinimg.com/736x/c9/f2/3e/c9f23e212529f13f19bad5602d84b78b.jpg";
  const imageEmbeddings = await jina.getImageEmbeddings([catImg1, catImg2]);
  console.log(
    "Get multiple image embeddings in a single request",
    imageEmbeddings,
  );
}

void main();
