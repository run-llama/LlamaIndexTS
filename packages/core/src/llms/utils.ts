import { z } from "zod";
import type {
  ChatMessage,
  MessageContentImageDataDetail,
  MessageContentTextDetail,
} from "./type";

export function addContentPart<AdditionalMessageOptions extends object>(
  message: ChatMessage<AdditionalMessageOptions>,
  part: MessageContentTextDetail | MessageContentImageDataDetail,
): void {
  if (part.type === "text") {
    if (typeof message.content === "string") {
      message.content += part.text;
    } else {
      message.content.push(part);
    }
  } else {
    if (typeof message.content === "string") {
      if (message.content === "") {
        message.content = [part];
      } else {
        message.content = [{ type: "text", text: message.content }, part];
      }
    } else {
      message.content.push(part);
    }
  }
}

export function isZodSchema(obj: unknown): obj is z.ZodType {
  const isZodObject =
    obj !== null &&
    typeof obj === "object" &&
    "parse" in obj &&
    typeof (obj as { parse: unknown }).parse === "function" &&
    "safeParse" in obj &&
    typeof (obj as { safeParse: unknown }).safeParse === "function";

  if (!isZodObject) return false;

  const isZod3Schema = "_def" in obj; // schema._def - Zod 3 schema

  const isZod4Schema =
    "_zod" in obj &&
    typeof obj._zod === "object" &&
    obj._zod !== null &&
    "def" in obj._zod; // schema._zod.def - Zod 4 schema

  return isZod3Schema || isZod4Schema;
}
