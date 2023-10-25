import { ChatMessage, OpenAI, SimpleChatEngine } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			message,
			chatHistory,
		}: {
			message: string;
			chatHistory: ChatMessage[];
		} = body;
		if (!message || !chatHistory) {
			return NextResponse.json(
				{
					error: "message, chatHistory are required in the request body",
				},
				{ status: 400 }
			);
		}

		const llm = new OpenAI({
			model: "gpt-3.5-turbo",
		});

		const chatEngine = new SimpleChatEngine({
			llm,
		});

		const response = await chatEngine.chat(message, chatHistory);
		const result: ChatMessage = {
			role: "assistant",
			content: response.response,
		};

		return NextResponse.json({ result });
	} catch (error) {
		console.error("[LlamaIndex]", error);
		return NextResponse.json(
			{
				error: (error as Error).message,
			},
			{
				status: 500,
			}
		);
	}
}
