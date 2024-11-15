import { Message } from "ai";
import { simulateReadableStream } from "ai/test";
import { NextRequest, NextResponse } from "next/server";

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
    const mockResponse = `Hello! This is a mock response to: ${userMessage.content}`;
    return new Response(
      simulateReadableStream({
        chunkDelayInMs: 20,
        values: mockResponse.split(" ").map((t) => `0:"${t} "\n`),
      }).pipeThrough(new TextEncoderStream()),
      {
        status: 200,
        headers: {
          "X-Vercel-AI-Data-Stream": "v1",
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  } catch (error) {
    const detail = (error as Error).message;
    return NextResponse.json({ detail }, { status: 500 });
  }
}
