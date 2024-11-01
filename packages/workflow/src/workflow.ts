import {
	type StepHandler,
	WorkflowContext
} from './workflow-context.js';
import {
	StartEvent,
	type AnyWorkflowEventConstructor,
	StopEvent,
	type StartEventConstructor,
	type StopEventConstructor
} from './workflow-event.js';

export type StepParameters<
	In extends AnyWorkflowEventConstructor[],
	Out extends AnyWorkflowEventConstructor[]
> = {
	inputs: In;
	outputs: Out;
}

export class Workflow<
	Context = unknown,
	Start = string,
	Stop = string,
> {
	#steps: Map<
		StepHandler<Context, never, never>,
		{
			inputs: AnyWorkflowEventConstructor[];
			outputs: AnyWorkflowEventConstructor[]
		}
	> = new Map();
	#verbose: boolean = false;
	#timeout: number | null = null;

	constructor (
		params: {
			verbose?: boolean;
			timeout?: number | null;
		} = {}
	) {
		this.#verbose = params.verbose ?? false;
		this.#timeout = params.timeout ?? null;
	}

	addStep<
		const In extends
			[
				AnyWorkflowEventConstructor | StartEventConstructor,
				...(AnyWorkflowEventConstructor | StopEventConstructor)[]
			],
		const Out extends [
			AnyWorkflowEventConstructor | StopEventConstructor,
			...(AnyWorkflowEventConstructor | StopEventConstructor)[]
		]
	> (
		parameters: StepParameters<In, Out>,
		stepFn: StepHandler<
			Context,
			In,
			Out
		>
	): this {
		const { inputs, outputs } = parameters;
		this.#steps.set(stepFn, { inputs, outputs });
		return this;
	}

	removeStep (stepFn: StepHandler): this {
		this.#steps.delete(stepFn);
		return this;
	}

	run (event: StartEvent<Start> | Start): never extends Context
		? WorkflowContext<Start, Stop, Context>
		: never;
	run<Data extends Context> (
		event: StartEvent<Start> | Start,
		data: Data
	): WorkflowContext<
		Start,
		Stop,
		Data
	>
	run<Data extends Context> (
		event: StartEvent<Start> | Start,
		data?: Data
	): WorkflowContext<
		Start,
		Stop,
		Data
	> {
		const startEvent: StartEvent<Start> = event instanceof StartEvent
			? event
			: new StartEvent(event);

		return new WorkflowContext<
			Start,
			Stop,
			Data
		>({
			startEvent,
			contextData: data!,
			steps: new Map(this.#steps),
			timeout: this.#timeout,
			verbose: this.#verbose,
			queue: undefined,
			pendingInputQueue: undefined,
			resolved: null,
			rejected: null
		});
	}
}
