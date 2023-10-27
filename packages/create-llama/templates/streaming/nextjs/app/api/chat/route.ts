import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;
    if (!messages) {
      return NextResponse.json(
        {
          error: "messages are required in the request body",
        },
        { status: 400 },
      );
    }

    // const llm = new OpenAI({
    //   model: "gpt-3.5-turbo",
    // });

    // const chatEngine = new SimpleChatEngine({
    //   llm,
    // });

    // const response = await chatEngine.chat(message, chatHistory);
    // const result: ChatMessage = {
    //   role: "assistant",
    //   content: response.response,
    // };

    // return NextResponse.json({ result });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages,
    });

    // Transform the response into a readable stream
    const stream = OpenAIStream(response);

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}
