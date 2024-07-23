import { MarkdownNodeParser } from "@llamaindex/core/node-parser";
import { Document, MetadataMode } from "@llamaindex/core/schema";
import { describe, expect, test } from "vitest";

describe("MarkdownNodeParser", () => {
  test("test_header_splits", () => {
    const markdownParser = new MarkdownNodeParser();

    const splits = markdownParser.getNodesFromDocuments([
      new Document({
        text: `# Main Header

Header 1 content

# Header 2
Header 2 content
    `,
      }),
    ]);

    expect(splits.length).toBe(2);
    expect(splits[0].metadata).toEqual({ Header_1: "Main Header" });
    expect(splits[1].metadata).toEqual({ Header_1: "Header 2" });
    expect(splits[0].getContent(MetadataMode.NONE)).toStrictEqual(
      "Main Header\n\nHeader 1 content",
    );
    expect(splits[1].getContent(MetadataMode.NONE)).toStrictEqual(
      "Header 2\nHeader 2 content",
    );
  });

  test("test_non_header_splits", () => {
    const markdownParser = new MarkdownNodeParser();

    const splits = markdownParser.getNodesFromDocuments([
      new Document({
        text: `# Header 1

#Not a header

Also # not a header

     # Still not a header
    `,
      }),
    ]);
    expect(splits.length).toBe(1);
  });

  test("test_pre_header_content", () => {
    const markdownParser = new MarkdownNodeParser();

    const splits = markdownParser.getNodesFromDocuments([
      new Document({
        text: `

pre-header content

# Header 1

Content

## Sub-header
    `,
      }),
    ]);
    expect(splits.length).toBe(3);
  });

  test("test_header_metadata", () => {
    const markdownParser = new MarkdownNodeParser();

    const splits = markdownParser.getNodesFromDocuments([
      new Document({
        text: `# Main Header

Content

## Sub-header

Content

### Sub-sub header

Content

# New title
    `,
      }),
    ]);
    expect(splits.length).toBe(4);
    expect(splits[0].metadata).toEqual({ Header_1: "Main Header" });
    expect(splits[1].metadata).toEqual({
      Header_1: "Main Header",
      Header_2: "Sub-header",
    });
    expect(splits[2].metadata).toEqual({
      Header_1: "Main Header",
      Header_2: "Sub-header",
      Header_3: "Sub-sub header",
    });
    expect(splits[3].metadata).toEqual({ Header_1: "New title" });
  });
});
