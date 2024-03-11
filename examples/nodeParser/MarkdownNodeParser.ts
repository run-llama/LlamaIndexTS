import { Document, MarkdownNodeParser } from "llamaindex";

async function main() {
  const markdownParser = new MarkdownNodeParser();

  const splits = markdownParser.getNodesFromDocuments([
    new Document({
      text: `# Main Header
Main content

# Header 2
Header 2 content

## Sub-header
Sub-header content

`,
    }),
  ]);

  console.log(splits);
}

main();
