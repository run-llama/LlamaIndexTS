import _, * as lodash from "lodash";
import { BaseNode, ObjectType } from "../../Node";
import { DEFAULT_NAMESPACE } from "../constants";
import { BaseKVStore } from "../kvStore/types";
import { BaseDocumentStore, RefDocInfo } from "./types";
import { docToJson, jsonToDoc } from "./utils";

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
      docs[key] = jsonToDoc(jsonDict[key] as Record<string, any>);
    }
    return docs;
  }

  async addDocuments(
    docs: BaseNode[],
    allowUpdate: boolean = true,
  ): Promise<void> {
    for (var idx = 0; idx < docs.length; idx++) {
      const doc = docs[idx];
      if (doc.id_ === null) {
        throw new Error("doc_id not set");
      }
      if (!allowUpdate && (await this.documentExists(doc.id_))) {
        throw new Error(
          `doc_id ${doc.id_} already exists. Set allow_update to True to overwrite.`,
        );
      }
      const nodeKey = doc.id_;
      const data = docToJson(doc);
      await this.kvstore.put(nodeKey, data, this.nodeCollection);
      const metadata: DocMetaData = { docHash: doc.hash };

      if (doc.getType() === ObjectType.TEXT && doc.sourceNode !== undefined) {
        const refDocInfo = (await this.getRefDocInfo(
          doc.sourceNode.nodeId,
        )) || {
          nodeIds: [],
          extraInfo: {},
        };
        refDocInfo.nodeIds.push(doc.id_);
        if (_.isEmpty(refDocInfo.extraInfo)) {
          refDocInfo.extraInfo = {};
        }
        await this.kvstore.put(
          doc.sourceNode.nodeId,
          refDocInfo,
          this.refDocCollection,
        );
        metadata.refDocId = doc.sourceNode.nodeId!;
      }

      this.kvstore.put(nodeKey, metadata, this.metadataCollection);
    }
  }

  async getDocument(
    docId: string,
    raiseError: boolean = true,
  ): Promise<BaseNode | undefined> {
    const json = await this.kvstore.get(docId, this.nodeCollection);
    if (_.isNil(json)) {
      if (raiseError) {
        throw new Error(`docId ${docId} not found.`);
      } else {
        return;
      }
    }
    return jsonToDoc(json);
  }

  async getRefDocInfo(refDocId: string): Promise<RefDocInfo | undefined> {
    const refDocInfo = await this.kvstore.get(refDocId, this.refDocCollection);
    return refDocInfo ? (_.clone(refDocInfo) as RefDocInfo) : undefined;
  }

  async getAllRefDocInfo(): Promise<Record<string, RefDocInfo> | undefined> {
    const refDocInfos = await this.kvstore.getAll(this.refDocCollection);
    if (_.isNil(refDocInfos)) {
      return;
    }
    return refDocInfos as Record<string, RefDocInfo>;
  }

  async refDocExists(refDocId: string): Promise<boolean> {
    return !_.isNil(await this.getRefDocInfo(refDocId));
  }

  async documentExists(docId: string): Promise<boolean> {
    return !_.isNil(await this.kvstore.get(docId, this.nodeCollection));
  }

  private async removeRefDocNode(docId: string): Promise<void> {
    const metadata = await this.kvstore.get(docId, this.metadataCollection);
    if (metadata === null) {
      return;
    }

    const refDocId = metadata.refDocId;
    if (_.isNil(refDocId)) {
      return;
    }

    const refDocInfo = await this.kvstore.get(refDocId, this.refDocCollection);
    if (!_.isNil(refDocInfo)) {
      lodash.pull(refDocInfo.docIds, docId);

      if (refDocInfo.docIds.length > 0) {
        this.kvstore.put(refDocId, refDocInfo.toDict(), this.refDocCollection);
      }
      this.kvstore.delete(refDocId, this.metadataCollection);
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
    if (_.isNil(refDocInfo)) {
      if (raiseError) {
        throw new Error(`ref_doc_id ${refDocId} not found.`);
      } else {
        return;
      }
    }

    for (const docId of refDocInfo.nodeIds) {
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
    return _.get(metadata, "docHash");
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
}
