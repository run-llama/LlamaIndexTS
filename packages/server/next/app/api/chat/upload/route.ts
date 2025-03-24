import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "../engine";
import { initSettings } from "../engine/settings";
import { uploadDocument } from "../llamaindex/documents/upload";

initSettings();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      base64,
      params,
    }: {
      name: string;
      base64: string;
      params?: any;
    } = await request.json();
    if (!base64 || !name) {
      return NextResponse.json(
        { error: "base64 and name is required in the request body" },
        { status: 400 },
      );
    }
    const index = await getDataSource(params);
    const documentFile = await uploadDocument(index, name, base64);
    return NextResponse.json(documentFile);
  } catch (error) {
    console.error("[Upload API]", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
