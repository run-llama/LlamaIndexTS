import { StartEvent, StopEvent, Workflow } from "@llamaindex/workflow";

type ContextData = {
  counter: number;
};

const contextData: ContextData = { counter: 0 };

const workflow = new Workflow<ContextData, string, string>();

workflow.addStep(
  {
    inputs: [StartEvent<string>],
    outputs: [StopEvent<string>],
  },
  async (context, startEvent) => {
    const input = startEvent.data;
    context.data.counter++;
    return new StopEvent(`Hello, ${input}!`);
  },
);

{
  const ret = await workflow.run("Alex", contextData);
  console.log(ret.data); // Hello, Alex!
}

{
  const ret = await workflow.run("World", contextData);
  console.log(ret.data); // Hello, World!
}

console.log(contextData.counter); // 2
