import {
  Document,
  KeywordTableIndex,
  KeywordTableRetrieverMode,
} from "llamaindex";
import essay from "./essay";

async function main() {
  const document = new Document({ text: essay, id_: "essay" });
  const index = await KeywordTableIndex.fromDocuments([document]);

  const allModes: KeywordTableRetrieverMode[] = [
    KeywordTableRetrieverMode.DEFAULT,
    KeywordTableRetrieverMode.SIMPLE,
    KeywordTableRetrieverMode.RAKE,
  ];
  allModes.forEach(async (mode) => {
    const queryEngine = index.asQueryEngine({
      retriever: index.asRetriever({
        mode,
      }),
    });
    const response = await queryEngine.query(
      "What did the author do growing up?",
    );
    console.log(response.toString());
  });
}

main().catch((e: Error) => {
  console.error(e, e.stack);
});
