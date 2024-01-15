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
    let jsonDict = await this.kvstore.getAll(this.nodeCollection);
    let docs: Record<string, BaseNode> = {};
    for (let key in jsonDict) {
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
      let nodeKey = doc.id_;
      let data = docToJson(doc);
      await this.kvstore.put(nodeKey, data, this.nodeCollection);
      let metadata: DocMetaData = { docHash: doc.hash };

      if (doc.getType() === ObjectType.TEXT && doc.sourceNode !== undefined) {
        let refDocInfo = (await this.getRefDocInfo(doc.sourceNode.nodeId)) || {
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

      this.kvstore.put(nodeKey, metadata, this.metadataCollection);
    }
  }

  async getDocument(
    docId: string,
    raiseError: boolean = true,
  ): Promise<BaseNode | undefined> {
    let json = await this.kvstore.get(docId, this.nodeCollection);
    if (json == null) {
      if (raiseError) {
        throw new Error(`docId ${docId} not found.`);
      } else {
        return;
      }
    }
    return jsonToDoc(json);
  }

  async getRefDocInfo(refDocId: string): Promise<RefDocInfo | undefined> {
    let refDocInfo = await this.kvstore.get(refDocId, this.refDocCollection);
    return refDocInfo ? (structuredClone(refDocInfo) as RefDocInfo) : undefined;
  }

  async getAllRefDocInfo(): Promise<Record<string, RefDocInfo> | undefined> {
    let refDocInfos = await this.kvstore.getAll(this.refDocCollection);
    if (refDocInfos == null) {
      return;
    }
    return refDocInfos as Record<string, RefDocInfo>;
  }

  async refDocExists(refDocId: string): Promise<boolean> {
    return !((await this.getRefDocInfo(refDocId)) == null);
  }

  async documentExists(docId: string): Promise<boolean> {
    return !((await this.kvstore.get(docId, this.nodeCollection)) == null);
  }

  private async removeRefDocNode(docId: string): Promise<void> {
    let metadata = await this.kvstore.get(docId, this.metadataCollection);
    if (metadata === null) {
      return;
    }

    let refDocId = metadata.refDocId;
    if (refDocId == null) {
      return;
    }

    const refDocInfo = await this.kvstore.get(refDocId, this.refDocCollection);
    if (!(refDocInfo == null)) {
      refDocInfo.nodeIds = refDocInfo.nodeIds.filter(
        (id: string) => id !== docId,
      );

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

    let deleteSuccess = await this.kvstore.delete(docId, this.nodeCollection);
    await this.kvstore.delete(docId, this.metadataCollection);

    if (!deleteSuccess && raiseError) {
      throw new Error(`doc_id ${docId} not found.`);
    }
  }

  async deleteRefDoc(
    refDocId: string,
    raiseError: boolean = true,
  ): Promise<void> {
    let refDocInfo = await this.getRefDocInfo(refDocId);
    if (refDocInfo == null) {
      if (raiseError) {
        throw new Error(`ref_doc_id ${refDocId} not found.`);
      } else {
        return;
      }
    }

    for (let docId of refDocInfo.nodeIds) {
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
    return metadata?.["docHash"];
  }
}
