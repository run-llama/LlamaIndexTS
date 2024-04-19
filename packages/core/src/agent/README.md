# Agent

> This is an internal code design document for the agent API.
>
> APIs are not exactly the same as the final version, but it is a good reference for what we are going to do.

Most of the agent logic is same with Python, but we have some changes to make it more suitable for JavaScript.

> https://github.com/run-llama/llama_index/tree/6b97753dec4a9c33b16c63a8333ddba3f49ec40f/docs/docs/module_guides/deploying/agents

## API Changes

### Classes changes

- Task: we don't have `Task` class in JS, we use `ReadableStream` instead.

- TaskStep: this is the step for each task run, includes like the input, the context, etc. This class will be used in taskHandler.

- TaskOutput: this is the output for each task run, includes like is last step, the output, etc.

### taskHandler

taskHandler is a function that takes a TaskStep and returns a TaskOutput.

```typescript
type TaskHandler = (step: TaskStep) => Promise<TaskOutput>;
```

### `createTask` to be AsyncGenerator

We use async generator to create task, since it's more suitable for JavaScript.

```typescript
const agent = new MyAgent();
const task = agent.createTask();
for await (const taskOutput of task) {
  // do something
}
```

### `from_*` -> `from`

In python, there is `from_tools`, `from_defaults`... etc.
But in JS/TS, we normalize them to `from`, since we can do this way
using [function overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads) in
TypeScript.

```typescript
class Agent {
  from(tools: BaseTool[]): Agent;
  from(defaults: Defaults): Agent;
  from(toolsOrDefaults: BaseTool[] | Defaults): Agent {
    // runtime check
  }
}
```

### No sync method for chat/query method

Force all methods to be async, since the all LLMs returns Promise.

### Cancelable

Use `AbortController` to cancel the task.

```typescript
const controller = new AbortController();
const task = agent.createTask({ signal: controller.signal });
process.on("SIGINT", () => controller.abort());
for await (const taskOutput of task) {
  // do something
}
```
