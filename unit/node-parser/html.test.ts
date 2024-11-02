import { Document } from "@llamaindex/core/schema";
import { HTMLNodeParser } from "@llamaindex/node-parser/html";
import { describe, expect, test } from "vitest";

describe("HTMLNodeParser", () => {
  test("basic split", async () => {
    const parser = new HTMLNodeParser();
    const result = parser.getNodesFromDocuments([
      new Document({
        text: `<DOCTYPE html>
<html>
	<head>
		<title>Test</title>
	</head>
	<body>
		<p>Hello World</p>
	</body>
</html>`,
      }),
    ]);
    expect(result.length).toEqual(1);
    expect(result[0]!.getContent()).toEqual("Hello World");
  });
});
