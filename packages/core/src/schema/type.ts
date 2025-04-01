import { fs, path, randomUUID } from "@llamaindex/env";
import type { BaseNode, Document } from "./node";

// fixme: remove any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoredValue = Record<string, any> | null;

interface TransformComponentSignature<
  Result extends BaseNode[] | Promise<BaseNode[]>,
> {
  <Options extends Record<string, unknown>>(
    nodes: BaseNode[],
    options?: Options,
  ): Result;
}

export interface TransformComponent<
  Result extends BaseNode[] | Promise<BaseNode[]> =
    | BaseNode[]
    | Promise<BaseNode[]>,
> extends TransformComponentSignature<Result> {
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class TransformComponent<
  Result extends BaseNode[] | Promise<BaseNode[]> =
    | BaseNode[]
    | Promise<BaseNode[]>,
> {
  constructor(transformFn: TransformComponentSignature<Result>) {
    Object.defineProperties(
      transformFn,
      Object.getOwnPropertyDescriptors(this.constructor.prototype),
    );
    const transform = function transform(
      ...args: Parameters<TransformComponentSignature<Result>>
    ) {
      return transformFn(...args);
    };
    Reflect.setPrototypeOf(transform, new.target.prototype);
    transform.id = randomUUID();
    return transform;
  }
}

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader<T extends BaseNode = Document> {
  loadData(...args: unknown[]): Promise<T[]>;
}

/**
 * A FileReader takes file paths and imports data into Document objects.
 */
export abstract class FileReader<T extends BaseNode = Document>
  implements BaseReader<T>
{
  abstract loadDataAsContent(
    fileContent: Uint8Array,
    filename?: string,
  ): Promise<T[]>;

  async loadData(filePath: string): Promise<T[]> {
    let fileContent: Uint8Array;
    let filename: string;

    // Check if filePath is a URL
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      // Handle URL
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch URL: ${filePath}, status: ${response.status}`,
        );
      }
      const buffer = await response.arrayBuffer();
      fileContent = new Uint8Array(buffer);
      // Extract filename from URL
      const url = new URL(filePath);
      filename = path.basename(url.pathname) || "url_document";
    } else {
      // Handle local file
      fileContent = await fs.readFile(filePath);
      filename = path.basename(filePath);
    }

    const docs = await this.loadDataAsContent(fileContent, filename);
    docs.forEach(FileReader.addMetaData(filePath));
    return docs;
  }

  static addMetaData(filePath: string) {
    return (doc: BaseNode, index: number) => {
      // generate id as loadDataAsContent is only responsible for the content
      doc.id_ = `${filePath}_${index + 1}`;
      doc.metadata["file_path"] = path.resolve(filePath);
      doc.metadata["file_name"] = path.basename(filePath);
    };
  }
}
