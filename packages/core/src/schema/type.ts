import { fs, path, randomUUID } from "@llamaindex/env";
import type { BaseNode, Document } from "./node";

interface TransformComponentSignature {
  <Options extends Record<string, unknown>>(
    nodes: BaseNode[],
    options?: Options,
  ): Promise<BaseNode[]>;
}

export interface TransformComponent extends TransformComponentSignature {
  id: string;
}

export class TransformComponent {
  constructor(transformFn: TransformComponentSignature) {
    Object.defineProperties(
      transformFn,
      Object.getOwnPropertyDescriptors(this.constructor.prototype),
    );
    const transform = function transform(
      ...args: Parameters<TransformComponentSignature>
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
export interface BaseReader {
  loadData(...args: unknown[]): Promise<Document[]>;
}

/**
 * A FileReader takes file paths and imports data into Document objects.
 */
export abstract class FileReader implements BaseReader {
  abstract loadDataAsContent(
    fileContent: Uint8Array,
    fileName?: string,
  ): Promise<Document[]>;

  async loadData(filePath: string): Promise<Document[]> {
    const fileContent = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const docs = await this.loadDataAsContent(fileContent, fileName);
    docs.forEach(FileReader.addMetaData(filePath));
    return docs;
  }

  static addMetaData(filePath: string) {
    return (doc: Document, index: number) => {
      // generate id as loadDataAsContent is only responsible for the content
      doc.id_ = `${filePath}_${index + 1}`;
      doc.metadata["file_path"] = path.resolve(filePath);
      doc.metadata["file_name"] = path.basename(filePath);
    };
  }
}
