import { JSONSchemaType } from "ajv";
import { BaseTool, ToolMetadata } from "llamaindex";
import { marked } from "marked";
import path from "node:path";
import { saveDocument } from "../../llamaindex/documents/helper";

const OUTPUT_DIR = "output/tools";

type DocumentParameter = {
  originalContent: string;
  fileName: string;
};

const DEFAULT_METADATA: ToolMetadata<JSONSchemaType<DocumentParameter>> = {
  name: "document_generator",
  description:
    "Generate HTML document from markdown content. Return a file url to the document",
  parameters: {
    type: "object",
    properties: {
      originalContent: {
        type: "string",
        description: "The original markdown content to convert.",
      },
      fileName: {
        type: "string",
        description: "The name of the document file (without extension).",
      },
    },
    required: ["originalContent", "fileName"],
  },
};

const COMMON_STYLES = `
  body {
    font-family: Arial, sans-serif;
    line-height: 1.3;
    color: #333;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  p {
    margin-bottom: 0.7em;
  }
  code {
    background-color: #f4f4f4;
    padding: 2px 4px;
    border-radius: 4px;
  }
  pre {
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1em;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  img {
    max-width: 90%;
    height: auto;
    display: block;
    margin: 1em auto;
    border-radius: 10px;
  }
`;

const HTML_SPECIFIC_STYLES = `
  body {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
`;

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        ${COMMON_STYLES}
        ${HTML_SPECIFIC_STYLES}
    </style>
</head>
<body>
    {{content}}
</body>
</html>
`;

export interface DocumentGeneratorParams {
  metadata?: ToolMetadata<JSONSchemaType<DocumentParameter>>;
}

export class DocumentGenerator implements BaseTool<DocumentParameter> {
  metadata: ToolMetadata<JSONSchemaType<DocumentParameter>>;

  constructor(params: DocumentGeneratorParams) {
    this.metadata = params.metadata ?? DEFAULT_METADATA;
  }

  private static async generateHtmlContent(
    originalContent: string,
  ): Promise<string> {
    return await marked(originalContent);
  }

  private static generateHtmlDocument(htmlContent: string): string {
    return HTML_TEMPLATE.replace("{{content}}", htmlContent);
  }

  async call(input: DocumentParameter): Promise<string> {
    const { originalContent, fileName } = input;

    const htmlContent =
      await DocumentGenerator.generateHtmlContent(originalContent);
    const fileContent = DocumentGenerator.generateHtmlDocument(htmlContent);

    const filePath = path.join(OUTPUT_DIR, `${fileName}.html`);

    return `URL: ${await saveDocument(filePath, fileContent)}`;
  }
}

export function getTools(): BaseTool[] {
  return [new DocumentGenerator({})];
}
