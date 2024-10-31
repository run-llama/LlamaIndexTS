
type SerializableValueInternal =
	Record<string, unknown>
	| number
	| string
	| boolean
	| null
	| undefined
	| SerializableValueInternal[];

export type SerializableValue =
	SerializableValueInternal
	| Record<string, SerializableValueInternal>;

// we don't have collections in TypeScript side, because we align with JavaScript side similarly
export abstract class BaseKVStore<Value extends SerializableValue = SerializableValue> {
	abstract put (
		key: string,
		val: Value,
		collection?: string,
	): Promise<void>;

	abstract get (key: string, collection?: string): Promise<Value | null>;

	abstract getAll (collection?: string): Promise<Record<string, Value>>;

	abstract delete (key: string, collection?: string): Promise<boolean>;
}

export abstract class BaseFileSystemKVStore<Value extends SerializableValue = SerializableValue> extends BaseKVStore<Value> {
	abstract persist (persistPath: string): Promise<void>;

	static fromPersistPath: <Value extends SerializableValue = SerializableValue> (persistPath: string) => Promise<BaseFileSystemKVStore<Value>>;
}
