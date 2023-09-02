import { Client, collectPaginatedAPI } from "@notionhq/client";
import * as md from "md-utils-ts";
import { Document } from "../Node";
import { BaseReader } from "./base";

type NotionClient = InstanceType<typeof Client>;

// Notion Page
type NotionPageRetrieveMethod = NotionClient["pages"]["retrieve"];
type NotionPartialPageObjectResponse = Awaited<
  ReturnType<NotionPageRetrieveMethod>
>;

// Notion Block
type NotionBlockListMethod = NotionClient["blocks"]["children"]["list"];
type NotionBlockListResponse = Awaited<ReturnType<NotionBlockListMethod>>;
type NotionBlockObjectResponse = NotionBlockListResponse["results"][number];
type ExtractBlockObjectResponse<T> = T extends { type: string } ? T : never;
type NotionBlock = ExtractBlockObjectResponse<NotionBlockObjectResponse>;
type NotionChildPageBlock = Extract<NotionBlock, { type: "child_page" }>;
type NotionParagraphBlock = Extract<NotionBlock, { type: "paragraph" }>;
type NotionTableRowBlock = Extract<NotionBlock, { type: "table_row" }>;
type NotionRichText = NotionParagraphBlock["paragraph"]["rich_text"];
type NotionAnnotations = NotionRichText[number]["annotations"];

const fetchNotionBlocks = (client: Client) => async (blockId: string) =>
  collectPaginatedAPI(client.blocks.children.list, {
    block_id: blockId,
  });

const fetchNotionPage = (client: Client) => (pageId: string) =>
  client.pages.retrieve({ page_id: pageId });

type Page = {
  metadata: {
    id: string;
    title: string;
    createdTime: string;
    lastEditedTime: string;
    parentId?: string;
  };
  lines: string[];
};

type Pages = Record<string, Page>;

const hasType = (block: NotionBlockObjectResponse): block is NotionBlock =>
  "type" in block;

const blockIs = <T extends NotionBlock["type"]>(
  block: NotionBlock,
  type: T,
): block is Extract<NotionBlock, { type: T }> => block.type === type;

const getCursor = (
  pageBlock: NotionChildPageBlock,
  parentId?: string,
): Page => ({
  metadata: {
    id: pageBlock.id,
    title: pageBlock.child_page.title,
    createdTime: pageBlock.created_time,
    lastEditedTime: pageBlock.last_edited_time,
    parentId,
  },
  lines: [],
});

const annotateText = (text: string, annotations: NotionAnnotations) => {
  if (annotations.code) text = md.inlineCode(text);
  if (annotations.bold) text = md.bold(text);
  if (annotations.italic) text = md.italic(text);
  if (annotations.strikethrough) text = md.del(text);
  if (annotations.underline) text = md.underline(text);

  return text;
};

const richTextToString = (richText: NotionRichText) =>
  richText
    .map(({ plain_text, annotations, href }) => {
      if (plain_text.match(/^\s*$/)) return plain_text;

      const leadingSpaceMatch = plain_text.match(/^(\s*)/);
      const trailingSpaceMatch = plain_text.match(/(\s*)$/);

      const leading_space = leadingSpaceMatch ? leadingSpaceMatch[0] : "";
      const trailing_space = trailingSpaceMatch ? trailingSpaceMatch[0] : "";

      const text = plain_text.trim();

      if (text === "") return leading_space + trailing_space;

      const annotatedText = annotateText(text, annotations);
      const linkedText = href ? md.anchor(annotatedText, href) : annotatedText;

      return leading_space + linkedText + trailing_space;
    })
    .join("");

const tableRowToString = (block: NotionTableRowBlock) =>
  `| ${block.table_row.cells
    .flatMap((row) => row.map((column) => richTextToString([column])))
    .join(" | ")} |`;

const blockToString = (block: NotionBlock): string => {
  switch (block.type) {
    case "divider":
      return md.hr();
    case "equation":
      return md.equationBlock(block.equation.expression);
    case "bookmark":
      return md.anchor(
        richTextToString(block.bookmark.caption),
        block.bookmark.url,
      );
    case "link_preview":
      return md.anchor(block.type, block.link_preview.url);
    case "link_to_page":
      const href =
        block.link_to_page.type === "page_id" ? block.link_to_page.page_id : "";
      return md.anchor(block.type, href);
    case "child_page":
      return `[${block.child_page.title}]`;
    case "child_database":
      return `[${block.child_database.title}]`;
    case "paragraph":
      return richTextToString(block.paragraph.rich_text);
    case "heading_1":
      return md.h1(richTextToString(block.heading_1.rich_text));
    case "heading_2":
      return md.h2(richTextToString(block.heading_2.rich_text));
    case "heading_3":
      return md.h3(richTextToString(block.heading_3.rich_text));
    case "bulleted_list_item":
      return md.bullet(richTextToString(block.bulleted_list_item.rich_text));
    case "numbered_list_item":
      return md.bullet(richTextToString(block.numbered_list_item.rich_text), 1);
    case "quote":
      return md.quote(richTextToString(block.quote.rich_text));
    case "table_row":
      return tableRowToString(block);
    case "to_do":
      return md.todo(
        richTextToString(block.to_do.rich_text),
        block.to_do.checked,
      );
    case "template":
      return richTextToString(block.template.rich_text);
    case "code":
      return md.codeBlock(block.code.language)(
        richTextToString(block.code.rich_text),
      );
    case "callout":
      return md.quote(richTextToString(block.callout.rich_text));

    case "image":
    case "video":
    case "audio":
    case "file":
    case "pdf":
    case "table":
    case "embed":
    case "breadcrumb":
    case "synced_block":
    case "table_of_contents":
    case "unsupported":
    default:
      return "";
  }
};

const getNest = (block: NotionBlock, baseNest: number) => {
  switch (block.type) {
    // Reset nest
    case "child_page":
      return 0;

    // Eliminates unnecessary nests due to NotionBlock structure
    case "table_row":
    case "column_list":
    case "column":
    case "synced_block":
      return baseNest;

    default:
      return baseNest + 1;
  }
};

const crawlPages =
  (client: Client) =>
  async (
    blocks: NotionBlockObjectResponse[],
    cursor: Page,
    pages: Pages = {},
    nest = 0,
  ): Promise<Pages> => {
    pages[cursor.metadata.id] = pages[cursor.metadata.id] || cursor;

    for (const block of blocks) {
      if (!hasType(block)) continue;

      const line = md.indent()(blockToString(block), nest);
      cursor.lines.push(line);

      if (block.has_children) {
        const blockId = blockIs(block, "synced_block")
          ? block.synced_block.synced_from?.block_id || block.id
          : block.id;
        const childBlocks = await fetchNotionBlocks(client)(blockId);
        const nextCursor = blockIs(block, "child_page")
          ? getCursor(block, cursor.metadata.id)
          : cursor;
        const childPages = await crawlPages(client)(
          childBlocks,
          nextCursor,
          pages,
          getNest(block, nest),
        );
        pages = { ...pages, ...childPages };
      }
    }

    return pages;
  };

const extractPageTitle = (page: NotionPartialPageObjectResponse) => {
  if (!("properties" in page)) return "";

  if (page.properties.title.type !== "title") return "";

  return page.properties.title.title[0].plain_text;
};

const nestHeading = (text: string) => (text.match(/^#+\s/) ? "#" + text : text);

const pagesToDocuments = (pages: Pages): Document[] =>
  Object.entries(pages).map(([, { lines, metadata }]) => {
    const title = md.h1(metadata.title);
    const body = lines.map(nestHeading);
    const text = [title, ...body].join("\n");
    return new Document({ text, metadata });
  });

export class NotionReader implements BaseReader {
  private client: Client;

  constructor(options: { client: Client }) {
    this.client = options.client;
  }

  async loadData(pageId: string): Promise<Document[]> {
    const rootPage = (await fetchNotionPage(this.client)(pageId)) as any;
    const rootPageTitle = extractPageTitle(rootPage);
    const rootBlocks = await fetchNotionBlocks(this.client)(rootPage.id);

    const cursor: Page = {
      metadata: {
        id: rootPage.id,
        title: rootPageTitle,
        createdTime: rootPage.created_time,
        lastEditedTime: rootPage.last_edited_time,
      },
      lines: [],
    };
    const pages = await crawlPages(this.client)(rootBlocks, cursor);

    return pagesToDocuments(pages);
  }
}
