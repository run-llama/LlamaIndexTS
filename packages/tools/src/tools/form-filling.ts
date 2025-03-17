import { Settings } from "@llamaindex/core/global";
import { tool } from "@llamaindex/core/tools";
import fs from "fs";
import Papa from "papaparse";
import path from "path";
import { z } from "zod";
import { getFileUrl, saveDocument } from "../helper";

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

export const extractMissingCells = () => {
  return tool({
    name: "extract_missing_cells",
    description:
      "Use this tool to extract missing cells in a CSV file and generate questions to fill them. This tool only works with local file path.",
    parameters: z.object({
      filePath: z.string().describe("The local file path to the CSV file."),
    }),
    execute: async ({ filePath }): Promise<MissingCell[]> => {
      let tableContent: string[][];
      try {
        tableContent = await readCsvFile(filePath);
      } catch (error) {
        throw new Error(
          "Failed to read CSV file. Make sure that you are reading a local file path (not a sandbox path).",
        );
      }

      const prompt = CSV_EXTRACTION_PROMPT.replace(
        "{table_content}",
        formatToMarkdownTable(tableContent),
      );

      const llm = Settings.llm;
      const response = await llm.complete({ prompt });
      const parsedResponse = JSON.parse(response.text) as {
        missing_cells: MissingCell[];
      };
      if (!parsedResponse.missing_cells) {
        throw new Error(
          "The answer is not in the correct format. There should be a missing_cells array.",
        );
      }
      return parsedResponse.missing_cells;
    },
  });
};

export type FillMissingCellsParams = {
  /** Directory where generated documents will be saved */
  outputDir: string;

  /** Prefix for the file server URL */
  fileServerURLPrefix?: string;
};

export type FillMissingCellsToolOutput = {
  isSuccess: boolean;
  errorMessage?: string;
  fileUrl?: string;
};

export const fillMissingCells = (params: FillMissingCellsParams) => {
  return tool({
    name: "fill_missing_cells",
    description:
      "Use this tool to fill missing cells in a CSV file with provided answers. This tool only works with local file path.",
    parameters: z.object({
      filePath: z.string().describe("The local file path to the CSV file."),
      cells: z
        .array(
          z.object({
            rowIndex: z.number(),
            columnIndex: z.number(),
            answer: z.string(),
          }),
        )
        .describe("Array of cells to fill with their answers"),
    }),
    execute: async ({ filePath, cells }): Promise<string> => {
      const { outputDir, fileServerURLPrefix } = params;

      // Read the CSV file
      const fileContent = await fs.promises.readFile(filePath, "utf8");

      // Parse CSV with PapaParse
      const parseResult = Papa.parse<string[]>(fileContent, {
        header: false, // Ensure the header is not treated as a separate object
        skipEmptyLines: false, // Ensure empty lines are not skipped
      });

      if (parseResult.errors.length) {
        throw new Error(
          "Failed to parse CSV file: " + parseResult.errors[0]?.message,
        );
      }

      const rows = parseResult.data;

      // Fill the cells with answers
      for (const cell of cells) {
        // Adjust rowIndex to start from 1 for data rows
        const adjustedRowIndex = cell.rowIndex + 1;
        if (
          adjustedRowIndex < rows.length &&
          cell.columnIndex < (rows[adjustedRowIndex]?.length ?? 0) &&
          rows[adjustedRowIndex]
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
      const newFilePath = path.join(outputDir, newFileName);

      await saveDocument(newFilePath, updatedContent);
      const newFileUrl = getFileUrl(newFilePath, { fileServerURLPrefix });

      return (
        "Successfully filled missing cells in the CSV file. File URL to show to the user: " +
        newFileUrl
      );
    },
  });
};

async function readCsvFile(filePath: string): Promise<string[][]> {
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
      const maxColumns = parsedData.data[0]?.length ?? 0;
      const paddedRows = parsedData.data.map((row) => {
        return [...row, ...Array(maxColumns - row.length).fill("")];
      });

      resolve(paddedRows);
    });
  });
}

function formatToMarkdownTable(data: string[][]): string {
  if (data.length === 0) return "";

  const maxColumns = data[0]?.length ?? 0;
  const headerRow = `| ${data[0]?.join(" | ") ?? ""} |`;
  const separatorRow = `| ${Array(maxColumns).fill("---").join(" | ")} |`;
  const dataRows = data.slice(1).map((row) => `| ${row.join(" | ")} |`);

  return [headerRow, separatorRow, ...dataRows].join("\n");
}
