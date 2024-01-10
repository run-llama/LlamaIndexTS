// src/llm/LLMChatParams.ts

import { ChatMessage, Event } from './types';

export interface LLMChatParamsStreaming {
  messages: ChatMessage[];
  parentEvent?: Event;
  stream?: boolean;
}

export interface LLMChatParamsNonStreaming {
  messages: ChatMessage[];
  parentEvent?: Event;
  stream?: boolean;
}
