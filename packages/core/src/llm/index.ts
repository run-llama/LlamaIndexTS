import { LLM } from './LLM';
import { AzureSession } from './azure';
import { getOpenAISession, OpenAISession } from './openai';
import { getPortkeySession, PortkeySession } from './portkey';
import { ReplicateSession } from './replicate';
import { OllamaModel } from './OllamaModel';

export type LLMType = 'openai' | 'azure' | 'portkey' | 'replicate' | 'ollama';

export {
  LLM,
  AzureSession,
  getOpenAISession,
  OpenAISession,
  getPortkeySession,
  PortkeySession,
  ReplicateSession,
  OllamaModel
};
