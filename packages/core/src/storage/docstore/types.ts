import { path } from '@llamaindex/env';
import { BaseNode } from '../../schema';
import { jsonSerializer, type Serializer } from './utils';

export const DEFAULT_PERSIST_FNAME = 'docstore.json';
export const DEFAULT_PERSIST_DIR = './storage';
export const DEFAULT_PERSIST_PATH = path.join(DEFAULT_PERSIST_DIR,
	DEFAULT_PERSIST_FNAME);

type RefDocInfo<ExtraInfo extends Record<string, unknown>> = {
	nodeIds: string[]
	extraInfo: ExtraInfo
}

export abstract class BaseDocumentStore {
	serializer: Serializer<
		Record<string, unknown>,
		// we don't care about what's the target type of the serialization, so we use any here
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		any
	> = jsonSerializer;

	abstract persist (
		persistPath: string
	): Promise<void>

	abstract get docs (): Promise<Map<string, BaseNode>>

	abstract addDocuments (
		docs: BaseNode[],
		allowUpdate: boolean,
		batchSize: number,
		storeText: boolean
	): Promise<void>

	abstract getDocument (
		docId: string,
		raiseError: boolean
	): Promise<BaseNode | undefined>

	abstract deleteDocument (
		docId: string,
		raiseError: boolean
	): Promise<void>

	abstract documentExists (
		docId: string
	): Promise<boolean>

	abstract setDocumentHash (
		docId: string,
		docHash: string
	): Promise<void>

	abstract getDocumentHash (
		docId: string
	): Promise<string | undefined>

	abstract getAllDocumentHashes (): Promise<Map<string, string>>

	abstract getAllRefDocInfo (): Promise<Map<string, RefDocInfo<Record<string, unknown>> | undefined>>

	abstract getRefDocInfo (
		refDocId: string
	): Promise<RefDocInfo<Record<string, unknown>> | undefined>

	abstract deleteRefDoc (
		refDocId: string,
		raiseError: boolean
	): Promise<void>

	abstract getNodes (
		nodeIds: string[],
		raiseError: boolean
	): Promise<BaseNode[]>

	abstract getNode (
		nodeId: string,
		raiseError: boolean
	): Promise<BaseNode>

	abstract getNodeDict (
		nodeIdDict: Record<number, string>
	): Promise<Record<number, BaseNode>>
}