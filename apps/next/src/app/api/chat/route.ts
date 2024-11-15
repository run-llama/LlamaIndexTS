import { llm } from "@/lib/utils";
import { LlamaIndexAdapter, type Message } from "ai";
import { Settings, SimpleChatEngine, type ChatMessage } from "llamaindex";
import { NextResponse, type NextRequest } from "next/server";

Settings.llm = llm;

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] };
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== "user") {
      return NextResponse.json(
        { detail: "Last message is not a user message" },
        { status: 400 },
      );
    }

    const chatEngine = new SimpleChatEngine();

    return LlamaIndexAdapter.toDataStreamResponse(
      await chatEngine.chat({
        message: userMessage.content,
        chatHistory: messages as ChatMessage[],
        stream: true,
      }),
      {},
    );
  } catch (error) {
    const detail = (error as Error).message;
    return NextResponse.json({ detail }, { status: 500 });
  }
}
