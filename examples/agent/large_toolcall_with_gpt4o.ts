import { FunctionTool, OpenAI, OpenAIAgent } from "llamaindex";

const csvData =
  "Country,Average Height (cm)\nNetherlands,156\nDenmark,158\nNorway,160";

const userQuestion = "Summary data in this csv";

(async () => {
  // Maximize the number of tokens by setting `maxTokens` to `undefined`, but it still fails for gpt-4o
  // The agent will succeed if we change the model to `gpt-4-turbo`
  // See thread: https://community.openai.com/t/gpt-4o-doesnt-consistently-respect-json-schema-on-tool-use/751125/7
  const llm = new OpenAI({ model: "gpt-4o", maxTokens: undefined });

  type Input = {
    code: string;
  };
  // initiate fake code interpreter
  const interpreterTool = FunctionTool.from<Input>(
    ({ code }) => {
      console.log(
        `To answer the user's question, call the following code:\n${code}`,
      );
      return code;
    },
    {
      name: "interpreter",
      description:
        "Execute python code in a Jupyter notebook cell and return any result, stdout, stderr, display_data, and error.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The python code to execute in a single cell.",
          },
        },
        required: ["code"],
      },
    },
  );

  const systemPrompt =
    "You are a Python interpreter.\n        - You are given tasks to complete and you run python code to solve them.\n        - The python code runs in a Jupyter notebook. Every time you call $(interpreter) tool, the python code is executed in a separate cell. It's okay to make multiple calls to $(interpreter).\n        - Display visualizations using matplotlib or any other visualization library directly in the notebook. Shouldn't save the visualizations to a file, just return the base64 encoded data.\n        - You can install any pip package (if it exists) if you need to but the usual packages for data analysis are already preinstalled.\n        - You can run any python code you want in a secure environment.";

  const agent = new OpenAIAgent({
    llm,
    tools: [interpreterTool],
    systemPrompt,
    verbose: true,
  });

  console.log(`User question: ${userQuestion}\n`);

  await agent.chat({
    message: [
      {
        type: "text",
        text: userQuestion,
      },
      {
        type: "text",
        text: `Use data from following CSV raw contents:\n${csvData}`,
      },
    ],
  });
})();
