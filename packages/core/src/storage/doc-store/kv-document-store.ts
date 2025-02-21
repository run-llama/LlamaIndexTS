import { DEFAULT_NAMESPACE } from "../../global";
import { BaseNode, ObjectType, type StoredValue } from "../../schema";
import type { BaseKVStore } from "../kv-store";
import {
  BaseDocumentStore,
  docToJson,
  isValidDocJson,
  jsonToDoc,
  type RefDocInfo,
} from "./base-document-store";

type DocMetaData = { docHash: string; refDocId?: string };

export class KVDocumentStore extends BaseDocumentStore {
  private kvstore: BaseKVStore;
  private nodeCollection: string;
  private refDocCollection: string;
  private metadataCollection: string;

  constructor(kvstore: BaseKVStore, namespace: string = DEFAULT_NAMESPACE) {
    super();
    this.kvstore = kvstore;
    this.nodeCollection = `${namespace}/data`;
    this.refDocCollection = `${namespace}/ref_doc_info`;
    this.metadataCollection = `${namespace}/metadata`;
  }

  async docs(): Promise<Record<string, BaseNode>> {
    const jsonDict = await this.kvstore.getAll(this.nodeCollection);
    const docs: Record<string, BaseNode> = {};
    for (const key in jsonDict) {
      const value = jsonDict[key];
      if (isValidDocJson(value)) {
        docs[key] = jsonToDoc(value, this.serializer);
      } else {
        console.warn(`Invalid JSON for docId ${key}`);
      }
    }
    return docs;
  }

  async addDocuments(
    docs: BaseNode[],
    allowUpdate: boolean = true,
  ): Promise<void> {
    for (let idx = 0; idx < docs.length; idx++) {
      const doc = docs[idx]!;
      if (doc.id_ === null) {
        throw new Error("doc_id not set");
      }
      if (!allowUpdate && (await this.documentExists(doc.id_))) {
        throw new Error(
          `doc_id ${doc.id_} already exists. Set allow_update to True to overwrite.`,
        );
      }
      const nodeKey = doc.id_;
      const data = docToJson(doc, this.serializer);
      await this.kvstore.put(nodeKey, data, this.nodeCollection);
      const metadata: DocMetaData = { docHash: doc.hash };

      if (doc.type === ObjectType.TEXT && doc.sourceNode !== undefined) {
        const refDocInfo = (await this.getRefDocInfo(
          doc.sourceNode.nodeId,
        )) || {
          nodeIds: [],
          extraInfo: {},
        };
        refDocInfo.nodeIds.push(doc.id_);
        if (Object.keys(refDocInfo.extraInfo).length === 0) {
          refDocInfo.extraInfo = {};
        }
        await this.kvstore.put(
          doc.sourceNode.nodeId,
          refDocInfo,
          this.refDocCollection,
        );
        metadata.refDocId = doc.sourceNode.nodeId!;
      }

      await this.kvstore.put(nodeKey, metadata, this.metadataCollection);
    }
  }

  async getDocument(
    docId: string,
    raiseError: boolean = true,
  ): Promise<BaseNode | undefined> {
    const json = await this.kvstore.get(docId, this.nodeCollection);
    if (this.isNil(json)) {
      if (raiseError) {
        throw new Error(`docId ${docId} not found.`);
      } else {
        return;
      }
    }
    if (!isValidDocJson(json)) {
      throw new Error(`Invalid JSON for docId ${docId}`);
    }
    return jsonToDoc(json, this.serializer);
  }

  async getRefDocInfo(refDocId: string): Promise<RefDocInfo | undefined> {
    const refDocInfo = await this.kvstore.get(refDocId, this.refDocCollection);
    return refDocInfo ? (structuredClone(refDocInfo) as RefDocInfo) : undefined;
  }

  async getAllRefDocInfo(): Promise<Record<string, RefDocInfo> | undefined> {
    const refDocInfos = await this.kvstore.getAll(this.refDocCollection);
    if (this.isNil(refDocInfos)) {
      return;
    }
    return refDocInfos as Record<string, RefDocInfo>;
  }

  async refDocExists(refDocId: string): Promise<boolean> {
    return !this.isNil(await this.getRefDocInfo(refDocId));
  }

  async documentExists(docId: string): Promise<boolean> {
    return !this.isNil(await this.kvstore.get(docId, this.nodeCollection));
  }

  private async removeRefDocNode(docId: string): Promise<void> {
    const metadata = await this.kvstore.get(docId, this.metadataCollection);
    if (metadata === null) {
      return;
    }

    const refDocId = metadata.refDocId;
    if (this.isNil(refDocId)) {
      return;
    }

    const refDocInfo = await this.kvstore.get(refDocId, this.refDocCollection);
    if (!this.isNil(refDocInfo)) {
      if (refDocInfo!.nodeIds.length > 0) {
        await this.kvstore.put(refDocId, refDocInfo, this.refDocCollection);
      }
      await this.kvstore.delete(refDocId, this.metadataCollection);
    }
  }

  async deleteDocument(
    docId: string,
    raiseError: boolean = true,
    removeRefDocNode: boolean = true,
  ): Promise<void> {
    if (removeRefDocNode) {
      await this.removeRefDocNode(docId);
    }

    const deleteSuccess = await this.kvstore.delete(docId, this.nodeCollection);
    await this.kvstore.delete(docId, this.metadataCollection);

    if (!deleteSuccess && raiseError) {
      throw new Error(`doc_id ${docId} not found.`);
    }
  }

  async deleteRefDoc(
    refDocId: string,
    raiseError: boolean = true,
  ): Promise<void> {
    const refDocInfo = await this.getRefDocInfo(refDocId);
    if (this.isNil(refDocInfo)) {
      if (raiseError) {
        throw new Error(`ref_doc_id ${refDocId} not found.`);
      } else {
        return;
      }
    }

    for (const docId of refDocInfo!.nodeIds) {
      await this.deleteDocument(docId, false, false);
    }

    await this.kvstore.delete(refDocId, this.metadataCollection);
    await this.kvstore.delete(refDocId, this.refDocCollection);
  }

  async setDocumentHash(docId: string, docHash: string): Promise<void> {
    const metadata = { docHash: docHash };
    await this.kvstore.put(docId, metadata, this.metadataCollection);
  }

  async getDocumentHash(docId: string): Promise<string | undefined> {
    const metadata = await this.kvstore.get(docId, this.metadataCollection);
    return metadata?.docHash;
  }

  async getAllDocumentHashes(): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {};
    const metadataDocs = await this.kvstore.getAll(this.metadataCollection);
    for (const docId in metadataDocs) {
      const hash = await this.getDocumentHash(docId);
      if (hash) {
        hashes[hash] = docId;
      }
    }
    return hashes;
  }

  private isNil(value: RefDocInfo | StoredValue | undefined): boolean {
    return value === null || value === undefined;
  }
}
