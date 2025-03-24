import { JSONSchemaType } from "ajv";
import fs from "fs";
import { BaseTool, Settings, ToolMetadata } from "llamaindex";
import Papa from "papaparse";
import path from "path";
import { saveDocument } from "../../llamaindex/documents/helper";

type ExtractMissingCellsParameter = {
  filePath: string;
};

export type MissingCell = {
  rowIndex: number;
  columnIndex: number;
  question: string;
};

const CSV_EXTRACTION_PROMPT = `You are a data analyst. You are given a table with missing cells.
Your task is to identify the missing cells and the questions needed to fill them.
IMPORTANT: Column indices should be 0-based

# Instructions:
- Understand the entire content of the table and the topics of the table.
- Identify the missing cells and the meaning of the data in the cells.
- For each missing cell, provide the row index and the correct column index (remember: first data column is 1).
- For each missing cell, provide the question needed to fill the cell (it's important to provide the question that is relevant to the topic of the table).
- Since the cell's value should be concise, the question should request a numerical answer or a specific value.
- Finally, only return the answer in JSON format with the following schema:
{
  "missing_cells": [
    {
      "rowIndex": number,
      "columnIndex": number,
      "question": string
    }
  ]
}
- If there are no missing cells, return an empty array.
- The answer is only the JSON object, nothing else and don't wrap it inside markdown code block.

# Example:
# |    | Name | Age | City |
# |----|------|-----|------|
# | 0  | John |     | Paris|
# | 1  | Mary |     |      |
# | 2  |      | 30  |      |
#
# Your thoughts:
# - The table is about people's names, ages, and cities.
# - Row: 1, Column: 2 (Age column), Question: "How old is Mary? Please provide only the numerical answer."
# - Row: 1, Column: 3 (City column), Question: "In which city does Mary live? Please provide only the city name."
# Your answer:
# {
#   "missing_cells": [
#     {
#       "rowIndex": 1,
#       "columnIndex": 2,
#       "question": "How old is Mary? Please provide only the numerical answer."
#     },
#     {
#       "rowIndex": 1,
#       "columnIndex": 3,
#       "question": "In which city does Mary live? Please provide only the city name."
#     }
#   ]
# }


# Here is your task:

- Table content:
{table_content}

- Your answer:
`;

const DEFAULT_METADATA: ToolMetadata<
  JSONSchemaType<ExtractMissingCellsParameter>
> = {
  name: "extract_missing_cells",
  description: `Use this tool to extract missing cells in a CSV file and generate questions to fill them. This tool only works with local file path.`,
  parameters: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "The local file path to the CSV file.",
      },
    },
    required: ["filePath"],
  },
};

export interface ExtractMissingCellsParams {
  metadata?: ToolMetadata<JSONSchemaType<ExtractMissingCellsParameter>>;
}

export class ExtractMissingCellsTool
  implements BaseTool<ExtractMissingCellsParameter>
{
  metadata: ToolMetadata<JSONSchemaType<ExtractMissingCellsParameter>>;
  defaultExtractionPrompt: string;

  constructor(params: ExtractMissingCellsParams) {
    this.metadata = params.metadata ?? DEFAULT_METADATA;
    this.defaultExtractionPrompt = CSV_EXTRACTION_PROMPT;
  }

  private readCsvFile(filePath: string): Promise<string[][]> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        const parsedData = Papa.parse<string[]>(data, {
          skipEmptyLines: false,
        });

        if (parsedData.errors.length) {
          reject(parsedData.errors);
          return;
        }

        // Ensure all rows have the same number of columns as the header
        const maxColumns = parsedData.data[0].length;
        const paddedRows = parsedData.data.map((row) => {
          return [...row, ...Array(maxColumns - row.length).fill("")];
        });

        resolve(paddedRows);
      });
    });
  }

  private formatToMarkdownTable(data: string[][]): string {
    if (data.length === 0) return "";

    const maxColumns = data[0].length;

    const headerRow = `| ${data[0].join(" | ")} |`;
    const separatorRow = `| ${Array(maxColumns).fill("---").join(" | ")} |`;

    const dataRows = data.slice(1).map((row) => {
      return `| ${row.join(" | ")} |`;
    });

    return [headerRow, separatorRow, ...dataRows].join("\n");
  }

  async call(input: ExtractMissingCellsParameter): Promise<MissingCell[]> {
    const { filePath } = input;
    let tableContent: string[][];
    try {
      tableContent = await this.readCsvFile(filePath);
    } catch (error) {
      throw new Error(
        `Failed to read CSV file. Make sure that you are reading a local file path (not a sandbox path).`,
      );
    }

    const prompt = this.defaultExtractionPrompt.replace(
      "{table_content}",
      this.formatToMarkdownTable(tableContent),
    );

    const llm = Settings.llm;
    const response = await llm.complete({
      prompt,
    });
    const rawAnswer = response.text;
    const parsedResponse = JSON.parse(rawAnswer) as {
      missing_cells: MissingCell[];
    };
    if (!parsedResponse.missing_cells) {
      throw new Error(
        "The answer is not in the correct format. There should be a missing_cells array.",
      );
    }
    const answer = parsedResponse.missing_cells;

    return answer;
  }
}

type FillMissingCellsParameter = {
  filePath: string;
  cells: {
    rowIndex: number;
    columnIndex: number;
    answer: string;
  }[];
};

const FILL_CELLS_METADATA: ToolMetadata<
  JSONSchemaType<FillMissingCellsParameter>
> = {
  name: "fill_missing_cells",
  description: `Use this tool to fill missing cells in a CSV file with provided answers. This tool only works with local file path.`,
  parameters: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "The local file path to the CSV file.",
      },
      cells: {
        type: "array",
        items: {
          type: "object",
          properties: {
            rowIndex: { type: "number" },
            columnIndex: { type: "number" },
            answer: { type: "string" },
          },
          required: ["rowIndex", "columnIndex", "answer"],
        },
        description: "Array of cells to fill with their answers",
      },
    },
    required: ["filePath", "cells"],
  },
};

export interface FillMissingCellsParams {
  metadata?: ToolMetadata<JSONSchemaType<FillMissingCellsParameter>>;
}

export class FillMissingCellsTool
  implements BaseTool<FillMissingCellsParameter>
{
  metadata: ToolMetadata<JSONSchemaType<FillMissingCellsParameter>>;

  constructor(params: FillMissingCellsParams = {}) {
    this.metadata = params.metadata ?? FILL_CELLS_METADATA;
  }

  async call(input: FillMissingCellsParameter): Promise<string> {
    const { filePath, cells } = input;

    // Read the CSV file
    const fileContent = await new Promise<string>((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // Parse CSV with PapaParse
    const parseResult = Papa.parse<string[]>(fileContent, {
      header: false, // Ensure the header is not treated as a separate object
      skipEmptyLines: false, // Ensure empty lines are not skipped
    });

    if (parseResult.errors.length) {
      throw new Error(
        "Failed to parse CSV file: " + parseResult.errors[0].message,
      );
    }

    const rows = parseResult.data;

    // Fill the cells with answers
    for (const cell of cells) {
      // Adjust rowIndex to start from 1 for data rows
      const adjustedRowIndex = cell.rowIndex + 1;
      if (
        adjustedRowIndex < rows.length &&
        cell.columnIndex < rows[adjustedRowIndex].length
      ) {
        rows[adjustedRowIndex][cell.columnIndex] = cell.answer;
      }
    }

    // Convert back to CSV format
    const updatedContent = Papa.unparse(rows, {
      delimiter: parseResult.meta.delimiter,
    });

    // Use the helper function to write the file
    const parsedPath = path.parse(filePath);
    const newFileName = `${parsedPath.name}-filled${parsedPath.ext}`;
    const newFilePath = path.join("output/tools", newFileName);

    const newFileUrl = await saveDocument(newFilePath, updatedContent);

    return (
      "Successfully filled missing cells in the CSV file. File URL to show to the user: " +
      newFileUrl
    );
  }
}
