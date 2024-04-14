import type { ChatMessage, MessageContent, MessageType } from "llamaindex";
import { expectTypeOf, test } from "vitest";
import type { ChatResponse } from "../src/index.js";

test("chat message type", () => {
  // case 1: if generic is not provided, `options` is not required
  expectTypeOf<ChatMessage>().toMatchTypeOf<{
    content: MessageContent;
    role: MessageType;
  }>();
  expectTypeOf<ChatMessage>().toMatchTypeOf<{
    content: MessageContent;
    role: MessageType;
    options?: Record<string, unknown>;
  }>();
  expectTypeOf<ChatMessage>().not.toMatchTypeOf<{
    content: MessageContent;
    role: MessageType;
    options: Record<string, unknown>;
  }>();

  type Options = {
    a: string;
    b: number;
  };
  // case 2: if generic is provided, `options` is required
  expectTypeOf<ChatMessage<Options>>().toMatchTypeOf<{
    content: MessageContent;
    role: MessageType;
    options: Options;
  }>();
});

test("chat response type", () => {
  // case 1: if generic is not provided, `options` is not required
  expectTypeOf<ChatResponse>().toMatchTypeOf<{
    message: ChatMessage;
    raw: object | null;
  }>();
  expectTypeOf<ChatResponse>().toMatchTypeOf<{
    message: ChatMessage;
    raw: object | null;
    options?: Record<string, unknown>;
  }>();
  expectTypeOf<ChatResponse>().not.toMatchTypeOf<{
    message: ChatMessage;
    raw: object | null;
    options: Record<string, unknown>;
  }>();

  // case 2: if generic is provided, `options` is required
  type Options = {
    a: string;
    b: number;
  };
  expectTypeOf<ChatResponse<Options>>().toMatchTypeOf<{
    message: ChatMessage<Options>;
    raw: object | null;
  }>();
});
