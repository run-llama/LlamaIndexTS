import { tool } from "@llamaindex/core/tools";
import { marked } from "marked";
import path from "node:path";
import { z } from "zod";
import { getFileUrl, saveDocument } from "../helper";

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

export type DocumentGeneratorParams = {
  /** Directory where generated documents will be saved */
  outputDir: string;
  /** Prefix for the file server URL */
  fileServerURLPrefix?: string;
};

export const documentGenerator = (params?: DocumentGeneratorParams) => {
  const {
    outputDir = path.join("output", "tools"),
    fileServerURLPrefix = "/api/files",
  } = params ?? {};

  return tool({
    name: "document_generator",
    description:
      "Generate HTML document from markdown content. Return a file url to the document",
    parameters: z.object({
      originalContent: z
        .string()
        .describe("The original markdown content to convert"),
      fileName: z
        .string()
        .describe("The name of the document file (without extension)"),
    }),
    execute: async ({ originalContent, fileName }): Promise<string> => {
      const htmlContent = await marked(originalContent);
      const fileContent = HTML_TEMPLATE.replace("{{content}}", htmlContent);

      const filePath = path.join(outputDir, `${fileName}.html`);
      await saveDocument(filePath, fileContent);
      const fileUrl = getFileUrl(filePath, { fileServerURLPrefix });

      return `URL: ${fileUrl}`;
    },
  });
};
