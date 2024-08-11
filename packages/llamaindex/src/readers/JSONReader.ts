import { parseChunked } from "@discoveryjs/json-ext";
import type { JSONValue } from "@llamaindex/core/global";
import { Document, FileReader } from "@llamaindex/core/schema";

// Possible improvements:
// - use `json-ext` for streaming JSON.stringify. Currently once JSON.stringify is called, the data is already chunked, so there should be no high risk of memory issues
// --> json-ext can use `stringifyInfo` to get the minimum byte lengths as well as return any circular references found, could be used to avoid erroring on circular references

export interface JSONReaderOptions {
  /**
   * The threshold for using streaming mode.
   * Give the approximate size of the JSON data in MB. Estimates character length by calculating: "(streamingThreshold * 1024 * 1024) / 2" and comparing against string.length
   * Streaming mode avoids memory issues when parsing large JSON data. Set "undefined" to disable streaming or "0" to always use streaming.
   *
   * @default 50 MB
   */
  streamingThreshold?: number;

  /**
   * Whether to ensure only ASCII characters.
   * Converts non-ASCII characters to their unicode escape sequence.
   *
   * @default false
   */
  ensureAscii?: boolean;

  /**
   * Whether the JSON is in JSON Lines format.
   * Split into lines, remove empty lines, parse each line as JSON.
   * Note: Uses a custom streaming parser, most likely less robust than json-ext
   *
   * @default false
   */
  isJsonLines?: boolean;

  /**
   * Whether to clean the JSON by filtering out structural characters (`{}, [], and ,`).
   * If set to false, it will just parse the JSON, not removing structural characters.
   *
   * @default true
   */
  cleanJson?: boolean;

  /**
   * Specifies how many levels up the JSON structure to include in the output. cleanJson will be ignored.
   * If set to 0, all levels are included. If undefined, parses the entire JSON and treats each line as an embedding.
   *
   * @default undefined
   */
  levelsBack?: number;

  /**
   * The maximum length of JSON string representation to be collapsed into a single line.
   * Only applicable when `levelsBack` is set.
   *
   * @default undefined
   */
  collapseLength?: number;

  /**
   * Whether to enable verbose logging.
   *
   * @default false
   */
  verbose?: boolean;

  /**
   * Provide a custom logger function.
   *
   * @default undefined
   */
  logger?: (level: string, message: string) => void;
}

export class JSONReaderError extends Error {}
export class JSONParseError extends JSONReaderError {}
export class JSONStringifyError extends JSONReaderError {}

class JSONParser {
  static async *parseJsonString(
    jsonStr: string,
    isJsonLines: boolean,
  ): AsyncGenerator<JSONValue> {
    try {
      if (isJsonLines) {
        for await (const value of JSONParser.parseJsonLines(jsonStr)) {
          yield value;
        }
      } else {
        yield JSON.parse(jsonStr);
      }
    } catch (e) {
      throw new JSONParseError(
        `Error parsing JSON string: ${e instanceof Error ? e.message : "Unknown error occurred"}`,
        { cause: e },
      );
    }
  }

  static async *parseJsonStream(
    content: Uint8Array,
    isJsonLines: boolean,
  ): AsyncGenerator<JSONValue> {
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(content);
        controller.close();
      },
    });

    try {
      if (isJsonLines) {
        yield* JSONParser.parseJsonLinesStream(stream);
      } else {
        yield* await parseChunked(stream);
      }
    } catch (e) {
      throw new JSONParseError(
        `Error parsing JSON stream: ${e instanceof Error ? e.message : "Unknown error occurred"}`,
        { cause: e },
      );
    }
  }

  static async *parseJsonLines(jsonStr: string): AsyncGenerator<JSONValue> {
    try {
      for (const line of jsonStr.split("\n")) {
        if (line.trim() !== "") {
          yield JSON.parse(line.trim());
        }
      }
    } catch (e) {
      throw new JSONParseError(
        `Error parsing JSON Line: ${
          e instanceof Error ? e.message : "Unknown error occurred"
        }`,
        { cause: e },
      );
    }
  }

  static async *parseJsonLinesStream(
    stream: ReadableStream<Uint8Array>,
  ): AsyncGenerator<JSONValue> {
    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            yield JSON.parse(line.trim());
          }
        }
      }

      if (buffer.trim()) {
        yield JSON.parse(buffer.trim());
      }
    } catch (e) {
      throw new JSONParseError(
        `Error parsing JSON Line in stream: ${
          e instanceof Error ? e.message : "Unknown error occurred"
        }`,
        { cause: e },
      );
    }
  }
}

/**
 * A reader that reads JSON data and returns an array of Document objects.
 * Supports various options to modify the output.
 */
export class JSONReader<T extends JSONValue> extends FileReader {
  private options: JSONReaderOptions;

  constructor(options: JSONReaderOptions = {}) {
    super();
    this.options = this.initializeOptions(options);
    this.log(
      "info",
      `JSONReader initialized with options: ${JSON.stringify(this.options)}`,
    );
  }

  private initializeOptions(
    providedOptions: JSONReaderOptions,
  ): JSONReaderOptions {
    const defaultOptions: JSONReaderOptions = {
      streamingThreshold: 50,
      ensureAscii: false,
      isJsonLines: false,
      cleanJson: true,
      verbose: false,
    };

    const options = { ...defaultOptions, ...providedOptions };

    // Validate options immediately after merging
    this.validateOptions(options, [
      "streamingThreshold",
      "collapseLength",
      "levelsBack",
    ]);

    return options;
  }

  private validateOptions(
    options: JSONReaderOptions,
    keys: (keyof JSONReaderOptions)[],
  ): void {
    for (const key of keys) {
      const value = options[key];
      if (typeof value === "number" && value < 0) {
        throw new JSONReaderError(`${key} must not be negative`);
      }
    }
  }

  private log(level: string, message: string): void {
    if (this.options.logger) {
      this.options.logger(level, message); // Use custom logger if provided
    } else {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
      if (this.options.verbose || level !== "debug") {
        console.log(`${formattedMessage}`);
      }
    }
  }

  /**
   * Loads JSON data and returns an array of Document objects.
   *
   * @param {Uint8Array} content - The JSON data as a Uint8Array.
   * @return {Promise<Document[]>} A Promise that resolves to an array of Document objects.
   */
  async loadDataAsContent(content: Uint8Array): Promise<Document[]> {
    const documents: Document[] = [];

    const parser = this.parseJson(content);
    for await (const document of parser) {
      documents.push(document);
    }

    return documents;
  }

  private async *parseJson(content: Uint8Array): AsyncGenerator<Document> {
    const jsonStr = new TextDecoder("utf-8").decode(content);
    const limit =
      ((this.options.streamingThreshold ?? Infinity) * 1024 * 1024) / 2;

    const parsedData =
      jsonStr.length > limit
        ? JSONParser.parseJsonStream(content, this.options.isJsonLines ?? false)
        : JSONParser.parseJsonString(
            jsonStr,
            this.options.isJsonLines ?? false,
          );

    this.log(
      "debug",
      `Using ${jsonStr.length > limit ? "streaming parser" : "JSON.parse"} as string length ${jsonStr.length > limit ? "exceeds" : "is less than"} calculated character limit: "${limit}"`,
    );

    for await (const value of parsedData) {
      // Yield the parsed data directly if cleanJson is false or the value is not an array.
      if (!this.options.cleanJson || !Array.isArray(value)) {
        yield await this.createDocument(value as T);
      } else {
        // If it's an Array, yield each item seperately, i.e. create a document per top-level array of the json
        for (const item of value) {
          yield await this.createDocument(item as T);
        }
      }
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
        return jsonStr
          .split("\n")
          .filter((line) => !/^[{}\[\],]*$/.test(line.trim()))
          .map((line) => line.trimStart())
          .join("\n");
      }
      return jsonStr;
    } catch (e) {
      throw new JSONStringifyError(
        `Error stringifying JSON data: ${
          e instanceof Error ? e.message : "Unknown error occurred"
        }`,
        { cause: e },
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

    try {
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
        `Error during depth-first traversal at path ${path.join(" ")}: ${
          e instanceof Error ? e.message : "Unknown error occurred"
        }`,
        { cause: e },
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
      throw new JSONStringifyError(
        `Error stringifying JSON data: ${
          e instanceof Error ? e.message : "Unknown error occurred"
        }`,
        { cause: e },
      );
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
        `Error during depth-first traversal of object: ${
          e instanceof Error ? e.message : "Unknown error occurred"
        }`,
        { cause: e },
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
