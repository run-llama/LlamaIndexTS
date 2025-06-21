import { XMLReader } from "@llamaindex/readers/xml";

async function main() {
  // Load PDF
  const reader = new XMLReader({
    splitLevel: 2,
  });
  const documents = await reader.loadData("../data/company.xml");

  for (const doc of documents) {
    console.log(doc.text);
    console.log("----");
  }
}

main().catch(console.error);
