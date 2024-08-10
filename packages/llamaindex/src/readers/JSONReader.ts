import type { JSONValue } from "@llamaindex/core/global";
import { Document, FileReader } from "@llamaindex/core/schema";
import { JSONParser } from "@streamparser/json-whatwg";

export interface JSONReaderOptions {
  /**
   * The threshold for using streaming mode.
   * Give the approximate size of the JSON data in MB. Estimates character length by calculating: "(streamingThreshold * 1024 * 1024) / 2" and comparing against string.length
   * Streaming mode avoids memory issues when parsing large JSON data. Set "undefined" to disable streaming. Set "0" to always use streaming.
   *
   * @default 100 MB
   */
  streamingThreshold?: number;

  /**
   * The size of the buffer used to store strings. Passthrough parameter of "@streamparser/json-whatwg"
   * Useful for edge evnironments, see https://github.com/juanjoDiaz/streamparser-json/tree/main/packages/whatwg for more details.
   *
   * @default undefined
   */
  stringBufferSize?: number;

  /**
   * The size of the buffer used to store numbers. Passthrough parameter of "@streamparser/json-whatwg
   * Useful for edge evnironments, see https://github.com/juanjoDiaz/streamparser-json/tree/main/packages/whatwg for more details.
   *
   * @default undefined
   */
  numberBufferSize?: number;
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
export class JSONReader<T extends JSONValue> extends FileReader {
  private options: JSONReaderOptions;

  constructor(options: JSONReaderOptions = {}) {
    super();
    this.options = {
      streamingThreshold: 100,
      ensureAscii: false,
      isJsonLines: false,
      cleanJson: true,
      ...options,
    };
    this.validateOptions();
  }
  private validateOptions(): void {
    const { levelsBack, collapseLength, streamingThreshold } = this.options;
    if (levelsBack !== undefined && levelsBack < 0) {
      throw new JSONReaderError("levelsBack must not be negative");
    }
    if (collapseLength !== undefined && collapseLength < 0) {
      throw new JSONReaderError("collapseLength must not be negative");
    }
    if (streamingThreshold !== undefined && streamingThreshold < 0) {
      throw new JSONReaderError("streamingThreshold must not be negative");
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

    const limit =
      ((this.options.streamingThreshold ?? Infinity) * 1024 * 1024) / 2;

    if (jsonStr.length > limit) {
      console.log(
        `Using streaming to parse JSON as character length exceeds calculated limit: "${limit}"`,
      );
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(content);
          controller.close();
        },
      });
      return await this.streamParseJsonString(stream);
    } else {
      const parser = this.parseJsonString(jsonStr);
      const documents: Document[] = [];

      for await (const data of parser) {
        documents.push(await this.createDocument(data));
      }
      return documents;
    }
  }

  private async streamParseJsonString(
    stream: ReadableStream<Uint8Array>,
  ): Promise<Document[]> {
    const parser = new JSONParser({
      paths: ["$"],
      stringBufferSize: this.options.stringBufferSize,
      numberBufferSize: this.options.numberBufferSize,
    });
    const reader = stream.pipeThrough(parser).getReader();
    const documents: Document[] = [];

    while (true) {
      const { done, value: parsedElementInfo } = await reader.read();
      if (done) break;

      const { value, partial } = parsedElementInfo;

      if (!partial) {
        if (Array.isArray(value)) {
          for (const item of value) {
            documents.push(await this.createDocument(item as T));
          }
        }
        documents.push(await this.createDocument(value as T));
      }
    }

    return documents;
  }

  private async *parseJsonString(jsonStr: string): AsyncGenerator<T> {
    if (this.options.isJsonLines) {
      yield* this.parseJsonLines(jsonStr);
    } else {
      yield* this.parseJson(jsonStr);
    }
  }

  private async *parseJsonLines(jsonStr: string): AsyncGenerator<T> {
    // Process each line as a separate JSON object for JSON Lines format
    for (const line of jsonStr.split("\n")) {
      if (line.trim() !== "") {
        try {
          yield JSON.parse(line.trim());
        } catch (e) {
          throw new JSONParseError(
            `Error parsing JSON Line: ${e} in "${line.trim()}"`,
          );
        }
      }
    }
  }

  private async *parseJson(jsonStr: string): AsyncGenerator<T> {
    try {
      // TODO: Add streaming to handle large JSON files
      const parsedData = JSON.parse(jsonStr);

      if (!this.options.cleanJson) {
        // Yield the parsed data directly if cleanJson is false
        yield parsedData;
      } else if (Array.isArray(parsedData)) {
        // Check if it's an Array, if so yield each item seperately, i.e. create a document per top-level array of the json
        for (const item of parsedData) {
          yield item;
        }
      } else {
        // If not an array, just yield the parsed data
        yield parsedData;
      }
    } catch (e) {
      throw new JSONParseError(`Error parsing JSON: ${e} in "${jsonStr}"`);
    }
  }

  private async createDocument(data: T): Promise<Document> {
    const docText: string =
      this.options.levelsBack === undefined
        ? this.formatJsonString(data)
        : await this.prepareDepthFirstYield(data);

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

  private async prepareDepthFirstYield(data: T): Promise<string> {
    const levelsBack = this.options.levelsBack ?? 0;
    const results: string[] = [];
    for await (const value of this.depthFirstYield(
      data,
      levelsBack === 0 ? Infinity : levelsBack,
      [],
      this.options.collapseLength,
    )) {
      results.push(value);
    }
    return results.join("\n");
  }

  // Note: JSON.stringify does not differentiate between indent "undefined/null"(= no whitespaces) and "0"(= no whitespaces, but linebreaks)
  // as python json.dumps does. Thats why we use indent 1 and remove the leading spaces.

  private formatJsonString(data: T): string {
    try {
      const jsonStr = JSON.stringify(
        data,
        null,
        this.options.cleanJson ? 1 : 0,
      );
      if (this.options.cleanJson) {
        // Clean JSON by removing structural characters and unnecessary whitespace
        return jsonStr
          .split("\n")
          .filter((line) => !/^[{}\[\],]*$/.test(line.trim()))
          .map((line) => line.trimStart()) // Removes the indent
          .join("\n");
      }
      return jsonStr;
    } catch (e) {
      throw new JSONStringifyError(
        `Error stringifying JSON: ${e} in "${JSON.stringify(data)}"`,
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
  private async *depthFirstYield(
    jsonData: T,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): AsyncGenerator<string> {
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
      throw new JSONReaderError(
        `Error during depth first traversal at path ${path.join(" ")}: ${e}`,
      );
    }
  }

  private serializeAndCollapse(
    jsonData: T,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): string | null {
    try {
      const jsonStr = JSON.stringify(jsonData);
      return collapseLength !== undefined && jsonStr.length <= collapseLength
        ? `${path.slice(-levelsBack).join(" ")} ${jsonStr}`
        : null;
    } catch (e) {
      throw new JSONStringifyError(`Error stringifying JSON data: ${e}`);
    }
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
  private async *depthFirstTraversal(
    jsonData: T,
    levelsBack: number,
    path: string[],
    collapseLength?: number,
  ): AsyncGenerator<string> {
    try {
      if (Array.isArray(jsonData)) {
        for (const item of jsonData) {
          yield* this.depthFirstYield(item, levelsBack, path, collapseLength);
        }
      } else if (jsonData !== null && typeof jsonData === "object") {
        const originalLength = path.length;
        for (const [key, value] of Object.entries(jsonData)) {
          path.push(key);
          if (value !== null) {
            yield* this.depthFirstYield(
              value as T,
              levelsBack,
              path,
              collapseLength,
            );
          }
          path.length = originalLength; // Reset path length to original. Avoids cloning the path array every time.
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
