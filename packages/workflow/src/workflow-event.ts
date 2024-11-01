export class WorkflowEvent<Data> {
	displayName: string;
	data: Data;

	constructor(data: Data) {
		this.data = data;
		this.displayName = this.constructor.name;
	}

	toString() {
		return this.displayName;
	}

	static or<
		A extends AnyWorkflowEventConstructor,
		B extends AnyWorkflowEventConstructor,
	>(AEvent: A, BEvent: B): A | B {
		function OrEvent() {
			throw new Error("Cannot instantiate OrEvent");
		}

		OrEvent.prototype = Object.create(AEvent.prototype);

		Object.getOwnPropertyNames(BEvent.prototype).forEach((property) => {
			if (!(property in OrEvent.prototype)) {
				Object.defineProperty(
					OrEvent.prototype,
					property,
					Object.getOwnPropertyDescriptor(BEvent.prototype, property)!,
				);
			}
		});

		OrEvent.prototype.constructor = OrEvent;

		Object.defineProperty(OrEvent, Symbol.hasInstance, {
			value: function (instance: unknown) {
				return instance instanceof AEvent || instance instanceof BEvent;
			},
		});

		return OrEvent as unknown as A | B;
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyWorkflowEventConstructor = new (data: any) => WorkflowEvent<any>;

export type StartEventConstructor<T = string> = new (data: T) => StartEvent<T>;
export type StopEventConstructor<T = string> = new (data: T) => StopEvent<T>;

// These are special events that are used to control the workflow
export class StartEvent<T> extends WorkflowEvent<T> {}
export class StopEvent<T> extends WorkflowEvent<T> {}
export class HaltEvent extends WorkflowEvent<never> {}
