import { BaseNode, Document, ObjectType, TextNode } from "../../Node";
import { BaseDocumentStore, RefDocInfo } from "./types";
import { BaseKVStore } from "../kvStore/types";
import _, * as lodash from "lodash";
import { docToJson, jsonToDoc } from "./utils";
import { DEFAULT_NAMESPACE } from "../constants";

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
    let jsonDict = await this.kvstore.getAll(this.nodeCollection);
    let docs: Record<string, BaseNode> = {};
    for (let key in jsonDict) {
      docs[key] = jsonToDoc(jsonDict[key] as Record<string, any>);
    }
    return docs;
  }

  async addDocuments(
    docs: BaseNode[],
    allowUpdate: boolean = true
  ): Promise<void> {
    for (var idx = 0; idx < docs.length; idx++) {
      const doc = docs[idx];
      if (doc.id_ === null) {
        throw new Error("doc_id not set");
      }
      if (!allowUpdate && (await this.documentExists(doc.id_))) {
        throw new Error(
          `doc_id ${doc.id_} already exists. Set allow_update to True to overwrite.`
        );
      }
      let nodeKey = doc.id_;
      let data = docToJson(doc);
      await this.kvstore.put(nodeKey, data, this.nodeCollection);
      let metadata: DocMetaData = { docHash: doc.hash };

      if (doc.getType() === ObjectType.TEXT && doc.sourceNode !== undefined) {
        let refDocInfo = (await this.getRefDocInfo(doc.sourceNode.nodeId)) || {
          docIds: [],
          extraInfo: {},
        };
        refDocInfo.docIds.push(doc.id_);
        if (_.isEmpty(refDocInfo.extraInfo)) {
          refDocInfo.extraInfo = {};
        }
        await this.kvstore.put(
          doc.sourceNode.nodeId,
          refDocInfo,
          this.refDocCollection
        );
        metadata.refDocId = doc.sourceNode.nodeId!;
      }

      this.kvstore.put(nodeKey, metadata, this.metadataCollection);
    }
  }

  async getDocument(
    docId: string,
    raiseError: boolean = true
  ): Promise<BaseNode | undefined> {
    let json = await this.kvstore.get(docId, this.nodeCollection);
    if (_.isNil(json)) {
      if (raiseError) {
        throw new Error(`doc_id ${docId} not found.`);
      } else {
        return;
      }
    }
    return jsonToDoc(json);
  }

  async getRefDocInfo(refDocId: string): Promise<RefDocInfo | undefined> {
    let refDocInfo = await this.kvstore.get(refDocId, this.refDocCollection);
    return refDocInfo ? (_.clone(refDocInfo) as RefDocInfo) : undefined;
  }

  async getAllRefDocInfo(): Promise<Record<string, RefDocInfo> | undefined> {
    let refDocInfos = await this.kvstore.getAll(this.refDocCollection);
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
    let metadata = await this.kvstore.get(docId, this.metadataCollection);
    if (metadata === null) {
      return;
    }

    let refDocId = metadata.refDocId;
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
    removeRefDocNode: boolean = true
  ): Promise<void> {
    if (removeRefDocNode) {
      await this.removeRefDocNode(docId);
    }

    let deleteSuccess = await this.kvstore.delete(docId, this.nodeCollection);
    await this.kvstore.delete(docId, this.metadataCollection);

    if (!deleteSuccess && raiseError) {
      throw new Error(`doc_id ${docId} not found.`);
    }
  }

  async deleteRefDoc(
    refDocId: string,
    raiseError: boolean = true
  ): Promise<void> {
    let refDocInfo = await this.getRefDocInfo(refDocId);
    if (_.isNil(refDocInfo)) {
      if (raiseError) {
        throw new Error(`ref_doc_id ${refDocId} not found.`);
      } else {
        return;
      }
    }

    for (let docId of refDocInfo.docIds) {
      await this.deleteDocument(docId, false, false);
    }

    await this.kvstore.delete(refDocId, this.metadataCollection);
    await this.kvstore.delete(refDocId, this.refDocCollection);
  }

  async setDocumentHash(docId: string, docHash: string): Promise<void> {
    let metadata = { docHash: docHash };
    await this.kvstore.put(docId, metadata, this.metadataCollection);
  }

  async getDocumentHash(docId: string): Promise<string | undefined> {
    let metadata = await this.kvstore.get(docId, this.metadataCollection);
    return _.get(metadata, "docHash");
  }
}
