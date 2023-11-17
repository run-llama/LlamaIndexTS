import {
  AutoProcessor,
  AutoTokenizer,
  CLIPModel,
  RawImage,
} from "@xenova/transformers";

async function main() {
  // Load tokenizer, processor, and model
  let tokenizer = await AutoTokenizer.from_pretrained(
    "Xenova/clip-vit-base-patch32",
  );
  let processor = await AutoProcessor.from_pretrained(
    "Xenova/clip-vit-base-patch32",
  );
  let model = await CLIPModel.from_pretrained("Xenova/clip-vit-base-patch32");

  // Run tokenization
  let texts = ["a photo of a car", "a photo of a football match"];
  let text_inputs = tokenizer(texts, { padding: true, truncation: true });

  // Read image and run processor
  let image = await RawImage.read(
    "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/football-match.jpg",
  );
  let image_inputs = await processor(image);

  // Run model with both text and pixel inputs
  let output = await model({ ...text_inputs, ...image_inputs });
  console.log(output);
}

main();
