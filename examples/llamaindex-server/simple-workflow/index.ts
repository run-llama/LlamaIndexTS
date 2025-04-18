import { OpenAI } from "@llamaindex/openai";
import { LlamaIndexServer } from "@llamaindex/server";
import { weather } from "@llamaindex/tools";
import "dotenv/config";
import { agent } from "llamaindex";

const weatherAgent = agent({
  tools: [weather()],
  llm: new OpenAI({ model: "gpt-4o-mini" }),
});

new LlamaIndexServer({
  workflow: () => weatherAgent,
  uiConfig: {
    appTitle: "Weather Research",
    starterQuestions: ["Ho Chi Minh city weather", "New York weather"],
  },
  port: 5000,
}).start();
