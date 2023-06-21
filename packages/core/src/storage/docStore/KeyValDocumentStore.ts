import { Node } from "../../Node";
import { BaseDocument } from '../../Document';
import { BaseDocumentStore, RefDocInfo } from './types';
import { BaseKVStore } from '../kvStore/types';
import _, * as lodash from 'lodash';
import { docToJson, jsonToDoc } from './docstore-utils';
import { DEFAULT_NAMESPACE } from '../constants';

type DocMetaData = { docHash: string, refDocId?: string };

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

    get docs(): Record<string, BaseDocument> {
        let jsonDict = this.kvstore.getAll(this.nodeCollection);
        let docs: Record<string, BaseDocument> = {};
        for (let key in jsonDict) {
            docs[key] = jsonToDoc(jsonDict[key]);
        }
        return docs;
    }

    async addDocuments(docs: BaseDocument[], allowUpdate: boolean = true): Promise<void> {
        for (var idx = 0; idx < docs.length; idx++) {
          const doc = docs[idx];
          if (doc.getDocId() === null) {
              throw new Error("doc_id not set");
          }
          if (!allowUpdate && await this.documentExists(doc.getDocId())) {
              throw new Error(`doc_id ${doc.getDocId()} already exists. Set allow_update to True to overwrite.`);
          }
          let nodeKey = doc.getDocId();
          let data = docToJson(doc);
          await this.kvstore.put(nodeKey, data, this.nodeCollection);
          let metadata: DocMetaData = { docHash: doc.getDocHash() };

          if (doc instanceof Node && doc.refDocId() !== null) {
              const nodeDoc = doc as Node;
              let refDocInfo = await this.getRefDocInfo(nodeDoc.refDocId()!) || {docIds: [], extraInfo: {}};
              refDocInfo.docIds.push(nodeDoc.getDocId());
              if (_.isEmpty(refDocInfo.extraInfo)) {
                  refDocInfo.extraInfo = nodeDoc.getNodeInfo() || {};
              }
              await this.kvstore.put(nodeDoc.refDocId()!, refDocInfo, this.refDocCollection);
              metadata.refDocId = nodeDoc.refDocId()!;
          }

          this.kvstore.put(nodeKey, metadata, this.metadataCollection);
        }
    }

    async getDocument(docId: string, raiseError: boolean = true): Promise<BaseDocument | undefined> {
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
        return refDocInfo ? _.clone(refDocInfo) as RefDocInfo : undefined;
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

    async deleteDocument(docId: string, raiseError: boolean = true, removeRefDocNode: boolean = true): Promise<void> {
        if (removeRefDocNode) {
            await this.removeRefDocNode(docId);
        }

        let deleteSuccess = await this.kvstore.delete(docId, this.nodeCollection);
        await this.kvstore.delete(docId, this.metadataCollection);

        if (!deleteSuccess && raiseError) {
            throw new Error(`doc_id ${docId} not found.`);
        }
    }

    async deleteRefDoc(refDocId: string, raiseError: boolean = true): Promise<void> {
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
      return _.get(metadata, 'docHash');
    }
}
