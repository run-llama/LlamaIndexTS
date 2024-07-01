import {
  ImageDocument,
  JinaAIEmbedding,
  similarity,
  SimilarityType,
  SimpleDirectoryReader,
} from "llamaindex";
import path from "path";

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

  // Calc similarity between text and image
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
  const sim3 = similarity(
    textEmbeddings[0],
    textEmbeddings[1],
    SimilarityType.DEFAULT,
  );
  console.log(
    `Similarity between the two texts "${text1}" and "${text2}" is ${sim3}`,
  );

  // Get multiple image embeddings
  const catImg1 =
    "https://i.pinimg.com/600x315/21/48/7e/21487e8e0970dd366dafaed6ab25d8d8.jpg";
  const catImg2 =
    "https://i.pinimg.com/736x/c9/f2/3e/c9f23e212529f13f19bad5602d84b78b.jpg";
  const imageEmbeddings = await jina.getImageEmbeddings([catImg1, catImg2]);
  const sim4 = similarity(
    imageEmbeddings[0],
    imageEmbeddings[1],
    SimilarityType.DEFAULT,
  );
  console.log(`Similarity between the two online cat images is ${sim4}`);

  // Get image embeddings from multiple local files
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: path.join("multimodal", "data"),
  });
  const localImages = documents
    .filter((doc) => doc instanceof ImageDocument)
    .slice(0, 2); // Get only the first two images
  const localImageEmbeddings = await jina.getImageEmbeddings(
    localImages.map((doc) => (doc as ImageDocument).image),
  );
  const sim5 = similarity(
    localImageEmbeddings[0],
    localImageEmbeddings[1],
    SimilarityType.DEFAULT,
  );
  console.log(`Similarity between the two local images is ${sim5}`);
}

void main();
