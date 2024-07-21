import { Document } from "@llamaindex/core/schema";
import { FileReader } from "./type.js";

interface JSONReaderOptions {
  /**
   * Whether to ensure only ASCII characters.
   * Converts non-ASCII characters to their unicode escape sequence.
   * @default false
   */
  ensureAscii?: boolean;

  /**
   * Whether the JSON is in JSON Lines format.
   * Split into lines, remove empty lines, parse each line as JSON.
   * @default false
   */
  isJsonLines?: boolean;

  /**
   * Whether to clean the JSON.
   * If set to false, it will just parse the JSON, not removing JsonData structural characters.
   * @default true
   */
  cleanJson?: boolean;

  /**
   * How many levels to go back when recursively traversing the JSON. cleanJson will be ignored.
   * If set to 0, it will traverse all levels. Default is undefined, which formats the entire JSON and treats each line as an embedding.
   * @default undefined
   */
  levelsBack?: number;

  /**
   * The maximum number of characters of a JSON fragment that should be collapsed into one line.
   * E.g. collapseLength=10 and jsonData = {a: [1, 2, 3], b: {"hello": "world", "foo": "bar"}},
   * a would be collapsed into one line, while b would not. LevelsBack must be set.
   * @default undefined
   */
  collapseLength?: number;
}

type JsonData =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonData }
  | Array<JsonData>;

class JSONReaderError extends Error {}
class JSONParseError extends JSONReaderError {}
class JSONStringifyError extends JSONReaderError {}

/**
 * A reader that reads JSON data and returns an array of Document objects.
 */
export class JSONReader extends FileReader {
  private options: JSONReaderOptions;

  constructor(options: JSONReaderOptions = {}) {
    super();
    this.options = {
      ensureAscii: options.ensureAscii ?? false,
      isJsonLines: options.isJsonLines ?? false,
      cleanJson: options.cleanJson ?? true,
      levelsBack: options.levelsBack,
      collapseLength: options.collapseLength,
    };
    this.validateOptions();
  }

  private validateOptions(): void {
    if (this.options.levelsBack !== undefined && this.options.levelsBack < 0) {
      throw new JSONReaderError("levelsBack must be a non-negative number");
    }
    if (this.options.collapseLength !== undefined && this.options.collapseLength < 0) {
      throw new JSONReaderError("collapseLength must be a non-negative number");
    }
  }

  /**
   * Loads JSON data and returns an array of Document objects.
   *
   * @param {Uint8Array} content - The JSON data as a Uint8Array.
   * @return {Promise<Document[]>} A Promise that resolves to an array of Document objects.
   */
  async loadDataAsContent(content: Uint8Array): Promise<Document[]> {
    const jsonStr = new TextDecoder("utf-8").decode(content);
    let parsedData: JsonData[];
    try {
      parsedData = this.parseJsonString(jsonStr);
    } catch (e) {
      throw new JSONParseError(`Error parsing JSON in loadDataAsContent: ${e}`);
    }
    return parsedData.map((data) => this.createDocument(data));
  }

  private createDocument(data: JsonData): Document {
    const levelsBack = this.options.levelsBack ?? 0;
    let docText: string;
    if (levelsBack === undefined) {
      docText = this.formatJsonString(data);
    } else {
      docText = [
        ...this.depthFirstYield(
          data,
          levelsBack === 0
            ? Infinity
            : levelsBack,
          [],
          this.options.collapseLength,
        ),
      ].join("\n");
    }
    return new Document({
      text: this.options.ensureAscii ? this.convertToAscii(docText) : docText,
      metadata: {},
    });
  }

  /**
   * Parses a JSON or JSON Lines (JSONL) string into an array of objects.
   * Standard JSON strings work by returning a single-element array
   * JSON Lines strings are split by new lines and each line is parsed as a separate JSON object.
   *
   * @param {string} jsonStr - The input string in JSON or JSONL format.
   * @returns {JsonData[]} An array of parsed JSON objects.
   * @throws {JSONParseError} if the input string cannot be parsed as JSON or JSONL.
   */
  private parseJsonString(jsonStr: string): JsonData[] {
    if (this.options.isJsonLines) {
      return jsonStr
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line, index) => {
          try {
            return JSON.parse(line.trim());
          } catch (e) {
            throw new JSONParseError(
              `Error parsing JSON Line at line ${index + 1}: ${e} in "${line}"`,
            );
          }
        });
    }
    try {
      return [JSON.parse(jsonStr)];
    } catch (e) {
      throw new JSONParseError(`Error parsing JSON: ${e} in "${jsonStr}"`);
    }
  }

  // Note: JSON.stringify does not differentiate between indent "undefined/null"(= no whitespaces) and "0"(= no whitespaces, but linebreaks)
  // as python json.dumps does. Thats why we use indent 1 and remove the leading spaces.

  /**
   * Converts JsonData JavaScript value to a JSON string with minimal formatting.
   * If 'cleanJson' option is enabled, filters out lines containing only JSON structural characters
   * (i.e., {}, [], and ,) and trims leading spaces from each line.
   * Otherwise a standard JSON.stringify operation is performed.
   *
   * @param {JsonData} data - The data to be stringified.
   * @returns {string} A JSON string representation of the input data
   * @throws {Error}  if the data cannot be converted to a JSON string.
   */
  private formatJsonString(data: JsonData): string {
    try {
      const jsonStr = JSON.stringify(
        data,
        null,
        this.options.cleanJson ? 1 : 0,
      );
      if (this.options.cleanJson) {
        return jsonStr
        .split("\n")
        .filter((line) => {
          const trimmedLine = line.trim();
          return trimmedLine !== "" && !/^[{}\[\],]*$/.test(trimmedLine);
        })
        .join("\n");
    }
      return jsonStr;
    } catch (e) {
      throw new JSONStringifyError(`Error stringifying JSON: ${e} in "${data}"`);
    }
  }

  /**
   * Recursively performs a depth-first traversal of a given JSON structure, yielding string representations of each element.
   * Optionally, elements shorter than the set `collapseLength` value are collapsed into a single line; otherwise, elements are recursively processed.
   * This method allows for detailed exploration of complex JSON objects, providing a mechanism to selectively simplify output.
   *
   * @param {JsonData} jsonData - The JSON data to traverse.
   * @param {number} levelsBack - How many levels up the path should be included. 0 traverses all levels.
   * @param {string[]} path - The current traversal path, used for building string representations.
   * @param {number} [collapseLength] - The maximum length of stringified JSON elements to collapse into a single line.
   * @yields {Generator<string>} Yields string representations of each json element.
   * @throws {JSONReaderError} Throws an error if the traversal or stringification process fails.
   */
  private *depthFirstYield(
    jsonData: JsonData,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): Generator<string> {
    try {
      const jsonStr = this.serializeAndCheckCollapse(
        jsonData,
        levelsBack,
        path,
        collapseLength,
      );
      if (jsonStr !== null) {
        yield jsonStr;
        return;
      }

      if (jsonData !== null && typeof jsonData === "object") {
        yield* this.depthFirstTraversal(
          jsonData,
          levelsBack,
          path,
          collapseLength,
        );
      } else {
        yield `${path.slice(-levelsBack).join(" ")} ${String(jsonData)}`;
      }
    } catch (e) {
      throw new JSONReaderError(`Error during depth first traversal: ${e}`);
    }
  }

  private serializeAndCheckCollapse(
    jsonData: JsonData,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): string | null {
    let jsonStr: string;
    try {
      jsonStr = JSON.stringify(jsonData);
    } catch (e) {
      throw new JSONStringifyError(`Error stringifying JSON data: ${e}`);
    }

    if (collapseLength !== undefined && jsonStr.length <= collapseLength) {
      return `${path.slice(-levelsBack).join(" ")} ${jsonStr}`;
    }

    return null;
  }

  private *depthFirstTraversal(
    jsonData: JsonData,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): Generator<string> {
    try {
      if (Array.isArray(jsonData)) {
        for (const item of jsonData) {
          yield* this.depthFirstYield(item, levelsBack, path, collapseLength);
        }
      } else if (jsonData !== null) {
        for (const [key, value] of Object.entries(jsonData)) {
          const newPath = [...path, key];
          if (Array.isArray(value) || typeof value === "object") {
            yield* this.depthFirstYield(value, levelsBack, newPath, collapseLength);
          } else {
            yield `${newPath.slice(-levelsBack).join(" ")} ${value === null ? "null" : String(value)}`;
          }
        }
      }
    } catch (e) {
      throw new JSONReaderError(`Error during depth-first traversal of object: ${e}`);
    }
  }

  /**
   * Convert non-ASCII characters to their unicode escape sequences.
   */
  private convertToAscii(str: string): string {
    return str.replace(
      /[\u007F-\uFFFF]/g,
      (char) => "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4),
    );
  }
}
