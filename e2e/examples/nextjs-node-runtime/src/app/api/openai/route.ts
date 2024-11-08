import { getOpenAIModelRequest } from "@/actions/openai";
import { NextRequest, NextResponse } from "next/server";

// POST /api/openai
export async function POST(request: NextRequest) {
  const body = await request.json();
  const content = await getOpenAIModelRequest(body.query);

  return NextResponse.json(content, { status: 200 });
}
