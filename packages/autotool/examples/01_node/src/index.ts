import { convertTools } from "@llamaindex/autotool";
import { OpenAI } from "openai";
import "./index.tool.js";

const openai = new OpenAI();
{
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "What's my current weather?",
      },
    ],
    tools: convertTools("openai"),
    stream: false,
  });

  const toolCalls = response.choices[0]!.message.tool_calls ?? [];
  for (const toolCall of toolCalls) {
    console.log(toolCall);
  }
}
