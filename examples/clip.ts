import { ClipEmbedding, similarity, SimilarityType } from "llamaindex";

async function main() {
  const clip = new ClipEmbedding();

  // Get text embeddings
  const text1 = "a car";
  const textEmbedding1 = await clip.getTextEmbedding(text1);
  const text2 = "a football match";
  const textEmbedding2 = await clip.getTextEmbedding(text2);

  // Get image embedding
  const image =
    "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/football-match.jpg";
  const imageEmbedding = await clip.getImageEmbedding(image);

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
}

main();
