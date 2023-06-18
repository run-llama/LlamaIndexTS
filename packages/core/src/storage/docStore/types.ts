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

    abstract getDocument(docId: string, raiseError: boolean): BaseDocument | null;

    abstract deleteDocument(docId: string, raiseError: boolean): void;

    abstract documentExists(docId: string): boolean;

    // Hash
    abstract setDocumentHash(docId: string, docHash: string): void;

    abstract getDocumentHash(docId: string): string | null;

    // Ref Docs
    abstract getAllRefDocInfo(): {[key: string]: RefDocInfo} | null;

    abstract getRefDocInfo(refDocId: string): RefDocInfo | null;

    abstract deleteRefDoc(refDocId: string, raiseError: boolean): void;

    // Nodes
    getNodes(nodeIds: string[], raiseError: boolean = true): Node[] {
        return nodeIds.map(nodeId => this.getNode(nodeId, raiseError));
    }

    getNode(nodeId: string, raiseError: boolean = true): Node {
        let doc = this.getDocument(nodeId, raiseError);
        if (!(doc instanceof Node)) {
            throw new Error(`Document ${nodeId} is not a Node.`);
        }
        return doc;
    }

    getNodeDict(nodeIdDict: {[key: number]: string}): {[key: number]: Node} {
        let result: {[key: number]: Node} = {};
        for (let index in nodeIdDict) {
            result[index] = this.getNode(nodeIdDict[index]);
        }
        return result;
    }
}
