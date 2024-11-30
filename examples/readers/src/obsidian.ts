import { ObsidianReader } from "@llamaindex/readers/obsidian";

const obsidianReader = new ObsidianReader(
  "/Users/jingyi/Documents/jingyi-vault",
);

obsidianReader.loadData().then((documents) => {
  console.log("documents:", documents.length);
  documents.forEach((doc) => {
    console.log(`document (${doc.id_}):`, doc.getText());
  });
});
