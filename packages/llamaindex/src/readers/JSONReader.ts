import { Document } from "@llamaindex/core/schema";
import type { JSONSchemaType } from "openai/lib/jsonschema.mjs";
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
   * Whether to clean the JSON by filtering out structural characters (`{}, [], and ,`).
   * If set to false, it will just parse the JSON, not removing structural characters.
   * @default true
   */
  cleanJson?: boolean;

  /**
   * Specifies how many levels up the JSON structure to include in the output. cleanJson will be ignored.
   * If set to 0, all levels are included. If undefined, parses the entire JSON and treats each line as an embedding.
   * @default undefined
   */
  levelsBack?: number;

  /**
   * The maximum length of JSON string representation to be collapsed into a single line.
   * Only applicable when `levelsBack` is set.
   * E.g. collapseLength=10 and jsonData = {a: [1, 2, 3], b: {"hello": "world", "foo": "bar"}},
   * a would be collapsed into one line, while b would not.
   * @default undefined
   */
  collapseLength?: number;
}

export class JSONReaderError extends Error {}
export class JSONParseError extends JSONReaderError {}
export class JSONStringifyError extends JSONReaderError {}

/**
 * A reader that reads JSON data and returns an array of Document objects.
 * Supports various options to modify the output.
 */
export class JSONReader extends FileReader {
  private options: JSONReaderOptions;

  /**
   * Constructs a new JSONReader with the given options.
   *
   * @param {JSONReaderOptions} options - The options for the JSONReader.
   */
  constructor(options: JSONReaderOptions = {}) {
    super();
    this.options = {
      ensureAscii: false,
      isJsonLines: false,
      cleanJson: true,
      ...options,
    };
    this.validateOptions();
  }
  private validateOptions(): void {
    const { levelsBack, collapseLength } = this.options;
    if (levelsBack !== undefined && levelsBack < 0) {
      throw new JSONReaderError("levelsBack must not be a negative number");
    }
    if (collapseLength !== undefined && collapseLength < 0) {
      throw new JSONReaderError("collapseLength must not be a negative number");
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
    let parsedData: JSONSchemaType[];
    try {
      parsedData = this.parseJsonString(jsonStr);
    } catch (e) {
      throw new JSONParseError(`Error parsing JSON: ${e}`);
    }
    return parsedData.map((data) => this.createDocument(data));
  }

  private parseJsonString(jsonStr: string): JSONSchemaType[] {
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

  private createDocument(data: JSONSchemaType): Document {
    let docText: string;
    if (this.options.levelsBack === undefined) {
      docText = this.formatJsonString(data);
    } else {
      const levelsBack = this.options.levelsBack ?? 0;
      docText = [
        ...this.depthFirstYield(
          data,
          levelsBack === 0 ? Infinity : levelsBack,
          [],
          this.options.collapseLength,
        ),
      ].join("\n");
    }
    return new Document({
      text: this.options.ensureAscii ? this.convertToAscii(docText) : docText,
      metadata: {
        doc_length: docText.length,
        traversal_data: {
          levels_back: this.options.levelsBack,
          collapse_length: this.options.collapseLength,
        },
      },
    });
  }

  // Note: JSON.stringify does not differentiate between indent "undefined/null"(= no whitespaces) and "0"(= no whitespaces, but linebreaks)
  // as python json.dumps does. Thats why we use indent 1 and remove the leading spaces.

  private formatJsonString(data: JSONSchemaType): string {
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
          .map((line) => line.trimStart()) // Removes the indent
          .join("\n");
      }
      return jsonStr;
    } catch (e) {
      throw new JSONStringifyError(
        `Error stringifying JSON: ${e} in "${data}"`,
      );
    }
  }

  /**
   * A generator function that determines the next step in traversing the JSON data.
   * If the serialized JSON string is not null, it yields the string and returns.
   * If the JSON data is an object, it delegates the traversal to the depthFirstTraversal method.
   * Otherwise, it yields the JSON data as a string.
   *
   * @param jsonData - The JSON data to traverse.
   * @param levelsBack - The number of levels up the JSON structure to include in the output.
   * @param path - The current path in the JSON structure.
   * @param collapseLength - The maximum length of JSON string representation to be collapsed into a single line.
   * @throws {JSONReaderError} - Throws an error if there is an issue during the depth-first traversal.
   */
  private *depthFirstYield(
    jsonData: JSONSchemaType,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): Generator<string> {
    try {
      const jsonStr = this.serializeAndCollapse(
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

  private serializeAndCollapse(
    jsonData: JSONSchemaType,
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

  /**
   * A generator function that performs a depth-first traversal of the JSON data.
   * If the JSON data is an array, it traverses each item in the array.
   * If the JSON data is an object, it traverses each key-value pair in the object.
   * For each traversed item or value, it performs a depth-first yield.
   *
   * @param jsonData - The JSON data to traverse.
   * @param levelsBack - The number of levels up the JSON structure to include in the output.
   * @param path - The current path in the JSON structure.
   * @param collapseLength - The maximum length of JSON string representation to be collapsed into a single line.
   * @throws {JSONReaderError} - Throws an error if there is an issue during the depth-first traversal of the object.
   */
  private *depthFirstTraversal(
    jsonData: JSONSchemaType,
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
            yield* this.depthFirstYield(
              value,
              levelsBack,
              newPath,
              collapseLength,
            );
          } else {
            yield `${newPath.slice(-levelsBack).join(" ")} ${value === null ? "null" : String(value)}`;
          }
        }
      }
    } catch (e) {
      throw new JSONReaderError(
        `Error during depth-first traversal of object: ${e}`,
      );
    }
  }

  private convertToAscii(str: string): string {
    return str.replace(
      /[\u007F-\uFFFF]/g,
      (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
    );
  }
}
