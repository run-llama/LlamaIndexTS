import "dotenv/config";

import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { AzureDynamicSessionTool, OpenAI, ReActAgent } from "llamaindex";

async function main() {
  // Settings.callbackManager.on("llm-start", (event) => {
  //   console.log("llm-start", event);
  // });
  // Settings.callbackManager.on("llm-end", (event) => {
  //   console.log("llm-end", event);
  // });
  // Settings.callbackManager.on("llm-stream", (event) => {
  //   console.log("llm-stream", event);
  // });
  // Settings.callbackManager.on("agent-start", (event) => {
  //   console.log("agent-start", event);
  // });
  // Settings.callbackManager.on("agent-end", (event) => {
  //   console.log("agent-end", event);
  // });
  // Settings.callbackManager.on("llm-tool-call", (event) => {
  //   console.log(event.detail.payload);
  // });
  // Settings.callbackManager.on("llm-tool-result", async (event) => {
  // await azureDynamicSession.downloadFile({
  //   remoteFilename: "chart.png",
  //   localFilename: "./chart.png",
  // });
  // console.log(await azureDynamicSession.listFiles());
  // console.log(event.detail.payload);
  // });

  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(
    credential,
    "https://cognitiveservices.azure.com/.default",
  );

  const azure = {
    azureADTokenProvider,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-35-turbo",
  };

  // configure LLM model
  const llm = new OpenAI({
    azure,
  });

  const azureDynamicSession = new AzureDynamicSessionTool();

  // Create an ReActAgent with the azure dynamic session tool
  const agent = new ReActAgent({
    llm,
    tools: [azureDynamicSession],
    // verbose: true,
    systemPrompt: `You are a Python interpreter.
      - You are given tasks to complete and you run python code to solve them.
      - The python code runs by the python runtime. Every time you call $(interpreter) tool, the python code is executed in a separate cell. It's okay to make multiple calls to $(interpreter).
      - You can run any python code you want in a secure environment.
      - For images, return the full URL, not the base64 data.
      - Return any image content as an HTML tag with the src attribute set to the URL of the image.`,
  });

  // Chat with the agent
  const response = await agent.chat({
    message:
      "plot a chart of 5 random numbers and save it to /mnt/data/chart.png",
    stream: false,
  });

  // Print the response
  console.log({ response });
}

void main().then(() => {
  console.log("Done");
});
