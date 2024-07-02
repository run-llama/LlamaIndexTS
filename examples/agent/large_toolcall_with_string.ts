import { FunctionTool, OpenAI, ToolCallOptions } from "llamaindex";

(async () => {
  // The tool call will generate a partial JSON for `gpt-4-turbo`
  // See thread: https://community.openai.com/t/gpt-4o-doesnt-consistently-respect-json-schema-on-tool-use/751125/7

  const models = ["gpt-4o", "gpt-4-turbo"];
  for (const model of models) {
    const validJSON = await callLLM({ model });
    console.log(
      `LLM call resulting in large tool input with '${model}': LLM generates ${validJSON ? "valid" : "invalid"} JSON.`,
    );
  }
})();

async function callLLM(init: Partial<OpenAI>) {
  const csvData = `Country,Average Height (cm)\n${"Netherlands,156\n".repeat(
    50,
  )}`;

  const userQuestion = "Describe data in this csv";

  // fake code interpreter tool
  const interpreterTool = FunctionTool.from(
    ({ data }: { data: string }) => data,
    {
      name: "interpreter",
      description:
        "Analyze csv raw data from a CSV file and return detail information.",
      parameters: {
        type: "object",
        properties: {
          data: {
            type: "string",
            description: "The data to analyze",
          },
        },
        required: ["data"],
      },
    },
  );

  const systemPrompt =
    "You are a Python interpreter.\n- You are given tasks to complete and you run python code to solve them.\n- The python code runs in a Jupyter notebook. Every time you call $(interpreter) tool, the python code is executed in a separate cell. It's okay to make multiple calls to $(interpreter).\n- Display visualizations using matplotlib or any other visualization library directly in the notebook. Shouldn't save the visualizations to a file, just return the base64 encoded data.\n- You can install any pip package (if it exists) if you need to but the usual packages for data analysis are already preinstalled.\n- You can run any python code you want in a secure environment.";

  const llm = new OpenAI(init);
  const response = await llm.chat({
    tools: [interpreterTool],
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userQuestion,
          },
          {
            type: "text",
            text: `Use data from following CSV raw contents:\n${csvData}`,
          },
        ],
      },
    ],
  });

  const options = response.message?.options as ToolCallOptions;
  const input = options.toolCall[0].input as string;

  console.log({ input });
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}
