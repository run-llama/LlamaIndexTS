import { Node } from "../../Node";
import { BaseDocument } from "../../Document";
import { GenericFileSystem } from "../FileSystem";
import { DEFAULT_PERSIST_DIR, DEFAULT_DOC_STORE_PERSIST_FILENAME } from "../constants";

const defaultPersistPath = `${DEFAULT_PERSIST_DIR}/${DEFAULT_DOC_STORE_PERSIST_FILENAME}`;


export interface RefDocInfo {
    docIds: string[];
    extraInfo: {[key: string]: any};
}

export abstract class BaseDocumentStore {
    // Save/load
    persist(persistPath: string = defaultPersistPath, fs?: GenericFileSystem): void {
        // Persist the docstore to a file.
    }

    // Main interface
    abstract get docs(): {[key: string]: BaseDocument};

    abstract addDocuments(docs: BaseDocument[], allowUpdate: boolean): void;

    abstract getDocument(docId: string, raiseError: boolean): Promise<BaseDocument | undefined>;

    abstract deleteDocument(docId: string, raiseError: boolean): void;

    abstract documentExists(docId: string): Promise<boolean>;

    // Hash
    abstract setDocumentHash(docId: string, docHash: string): void;

    abstract getDocumentHash(docId: string): Promise<string | undefined>;

    // Ref Docs
    abstract getAllRefDocInfo(): Promise<{[key: string]: RefDocInfo} | undefined>;

    abstract getRefDocInfo(refDocId: string): Promise<RefDocInfo | undefined>;

    abstract deleteRefDoc(refDocId: string, raiseError: boolean): Promise<void>;

    // Nodes
    getNodes(nodeIds: string[], raiseError: boolean = true): Promise<Node[]> {
        return Promise.all(nodeIds.map(nodeId => this.getNode(nodeId, raiseError)));
    }

    async getNode(nodeId: string, raiseError: boolean = true): Promise<Node> {
        let doc = await this.getDocument(nodeId, raiseError);
        if (!(doc instanceof Node)) {
            throw new Error(`Document ${nodeId} is not a Node.`);
        }
        return doc;
    }

    async getNodeDict(nodeIdDict: {[index: number]: string}): Promise<{[index: number]: Node}> {
        let result: {[index: number]: Node} = {};
        for (let index in nodeIdDict) {
            result[index] = await this.getNode(nodeIdDict[index]);
        }
        return result;
    }
}
