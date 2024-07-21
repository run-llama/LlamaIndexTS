import { Document } from "@llamaindex/core/schema";
import { FileReader } from "./type.js";

export interface JSONReaderOptions {
  /**
   * Whether to ensure only ASCII characters.
   * Converts non-ASCII characters to their unicode escape sequence.
   * @default false
   */
  ensureAscii?: boolean;

  /**
   * Whether the JSON is in the JSON Lines format.
   * Split into lines, remove empty lines, parse each line as JSON.
   * @default false
   */
  isJsonl?: boolean;

  /**
   * Whether to clean the JSON.
   * If set to false, it will just parse the JSON, not removing any structural characters.
   * @default true
   */
  cleanJson?: boolean;

  /**
   * How many levels to go back when recursively traversing the JSON. cleanJson will be ignored.
   * If set to 0, it will traverse all levels. Default = undefined formats the entire JSON and treats each line as an embedding.
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

/**
 * A reader that reads JSON data and returns an array of Document objects.
 */
export class JSONReader extends FileReader {
  private options: JSONReaderOptions;

  constructor(options: JSONReaderOptions = {}) {
    super();
    this.options = {
      ensureAscii: false,
      isJsonl: false,
      cleanJson: true,
      ...options,
    };
  }

  /**
   * Loads JSON data and returns an array of Document objects.
   *
   * @param {Uint8Array} content - The JSON data as a Uint8Array.
   * @return {Promise<Document[]>} A Promise that resolves to an array of Document objects.
   */
  async loadDataAsContent(content: Uint8Array): Promise<Document[]> {
    const jsonString = new TextDecoder("utf-8").decode(content);
    let loadData: any[];
    try {
      loadData = this.parseJsonString(jsonString);
    } catch (e) {
      throw new Error(`Error parsing JSON: ${e}`);
    }
    return loadData.map((data) => {
      let docText;
      if (this.options.levelsBack === undefined) {
        docText = this.noLevelsBack(data);
      } else {
        docText = [
          ...this.depthFirstYield(
            data,
            // levelsBack 0 traverses all levels
            this.options.levelsBack === 0
              ? Infinity
              : this.options.levelsBack || 0,
            [],
            this.options.collapseLength,
          ),
        ].join("\n");
      }
      return new Document({
        text: this.options.ensureAscii ? this.convertToAscii(docText) : docText,
        metadata: {},
      });
    });
  }

  /**
   * Parses a JSON string into an array of objects.
   */
  private parseJsonString(jsonString: string): any[] {
    if (this.options.isJsonl) {
      return jsonString
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          try {
            return JSON.parse(line.trim());
          } catch (e) {
            throw new Error(`Error parsing JSON Line: ${e} in line "${line}"`);
          }
        });
    }
    try {
      return [JSON.parse(jsonString)];
    } catch (e) {
      throw new Error(`Error parsing JSON: ${e} in "${jsonString}"`);
    }
  }

  /**
   * Stringify the JSON objects, filter out lines that contain only structural characters, and remove leading spaces from each line
   */ // Note: JSON.stringify does not differentiate between indent "undefined/null"(= no whitespaces) and "0"(= no whitespaces, but linebreaks)
  // as python json.dumps does. Thats why we use indent 1 and remove the leading spaces.
  private noLevelsBack(data: any): string {
    try {
      const jsonString = JSON.stringify(
        data,
        null,
        this.options.cleanJson ? 1 : 0,
      );
      if (this.options.cleanJson) {
        return jsonString
          .split("\n")
          .filter((line) => !/^[{}\[\],]*$/.test(line.trim()))
          .map((line) => line.trim())
          .join("\n");
      }
      return jsonString;
    } catch (e) {
      throw new Error(`Error stringifying JSON: ${e} in "${data}"`);
    }
  }

  /**
   * Performs a depth-first traversal of JSON data, yielding string representations of each element.
   * Optionally collapses data into a single line if it's below a certain length (collapseLength).
   */
  private *depthFirstYield(
    jsonData: any,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): Generator<string> {
    try {
      const jsonString = this.serializeAndCheckCollapse(jsonData, levelsBack, path, collapseLength);
      if (jsonString !== null) {
        yield jsonString;
        return;
      }
  
      if (typeof jsonData === "object" && jsonData !== null) {
        yield* this.depthFirstTraversal(jsonData, levelsBack, path, collapseLength);
      } else {
        yield `${path.slice(-levelsBack).join(" ")} ${String(jsonData)}`;
      }
    } catch (e) {
      throw new Error(`Error during depth first traversal: ${e}`);
    }
  }
  
  private serializeAndCheckCollapse(
    jsonData: any,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): string | null {
    const jsonString = JSON.stringify(jsonData);
  
    if (collapseLength !== undefined && jsonString.length <= collapseLength) {
      return `${path.slice(-levelsBack).join(" ")} ${jsonString}`;
    }
  
    return null;
  }
  
  private *depthFirstTraversal(
    jsonData: any,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): Generator<string> {
    if (Array.isArray(jsonData)) {
      for (const item of jsonData) {
        yield* this.depthFirstYield(item, levelsBack, path, collapseLength);
      }
    } else {
      for (const [key, value] of Object.entries(jsonData)) {
        const newPath = [...path, key];
        if (Array.isArray(value) || typeof value === "object") {
          yield* this.depthFirstYield(value, levelsBack, newPath, collapseLength);
        } else {
          yield `${newPath.slice(-levelsBack).join(" ")} ${String(value)}`;
        }
      }
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
