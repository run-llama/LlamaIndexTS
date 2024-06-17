type Fetch = typeof fetch;
interface Config {
  host: string;
  fetch?: Fetch;
  proxy?: boolean;
}
interface Options {
  numa: boolean;
  num_ctx: number;
  num_batch: number;
  main_gpu: number;
  low_vram: boolean;
  f16_kv: boolean;
  logits_all: boolean;
  vocab_only: boolean;
  use_mmap: boolean;
  use_mlock: boolean;
  embedding_only: boolean;
  num_thread: number;
  num_keep: number;
  seed: number;
  num_predict: number;
  top_k: number;
  top_p: number;
  tfs_z: number;
  typical_p: number;
  repeat_last_n: number;
  temperature: number;
  repeat_penalty: number;
  presence_penalty: number;
  frequency_penalty: number;
  mirostat: number;
  mirostat_tau: number;
  mirostat_eta: number;
  penalize_newline: boolean;
  stop: string[];
}
interface GenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  stream?: boolean;
  raw?: boolean;
  format?: string;
  images?: Uint8Array[] | string[];
  keep_alive?: string | number;
  options?: Partial<Options>;
}
interface Message {
  role: string;
  content: string;
  images?: Uint8Array[] | string[];
}
interface ChatRequest {
  model: string;
  messages?: Message[];
  stream?: boolean;
  format?: string;
  keep_alive?: string | number;
  options?: Partial<Options>;
}
interface PullRequest {
  model: string;
  insecure?: boolean;
  stream?: boolean;
}
interface PushRequest {
  model: string;
  insecure?: boolean;
  stream?: boolean;
}
interface CreateRequest {
  model: string;
  path?: string;
  modelfile?: string;
  stream?: boolean;
}
interface DeleteRequest {
  model: string;
}
interface CopyRequest {
  source: string;
  destination: string;
}
interface ShowRequest {
  model: string;
  system?: string;
  template?: string;
  options?: Partial<Options>;
}
interface EmbeddingsRequest {
  model: string;
  prompt: string;
  keep_alive?: string | number;
  options?: Partial<Options>;
}
interface GenerateResponse {
  model: string;
  created_at: Date;
  response: string;
  done: boolean;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}
interface ChatResponse {
  model: string;
  created_at: Date;
  message: Message;
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}
interface EmbeddingsResponse {
  embedding: number[];
}
interface ProgressResponse {
  status: string;
  digest: string;
  total: number;
  completed: number;
}
interface ModelResponse {
  name: string;
  modified_at: Date;
  size: number;
  digest: string;
  details: ModelDetails;
}
interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}
interface ShowResponse {
  license: string;
  modelfile: string;
  parameters: string;
  template: string;
  system: string;
  details: ModelDetails;
  messages: Message[];
}
interface ListResponse {
  models: ModelResponse[];
}
interface ErrorResponse {
  error: string;
}
interface StatusResponse {
  status: string;
}

declare class Ollama {
  protected readonly config: Config;
  protected readonly fetch: Fetch;
  private abortController;
  constructor(config?: Partial<Config>);
  abort(): void;
  protected processStreamableRequest<T extends object>(
    endpoint: string,
    request: {
      stream?: boolean;
    } & Record<string, any>,
  ): Promise<T | AsyncGenerator<T>>;
  encodeImage(image: Uint8Array | string): Promise<string>;
  generate(
    request: GenerateRequest & {
      stream: true;
    },
  ): Promise<AsyncGenerator<GenerateResponse>>;
  generate(
    request: GenerateRequest & {
      stream?: false;
    },
  ): Promise<GenerateResponse>;
  chat(
    request: ChatRequest & {
      stream: true;
    },
  ): Promise<AsyncGenerator<ChatResponse>>;
  chat(
    request: ChatRequest & {
      stream?: false;
    },
  ): Promise<ChatResponse>;
  create(
    request: CreateRequest & {
      stream: true;
    },
  ): Promise<AsyncGenerator<ProgressResponse>>;
  create(
    request: CreateRequest & {
      stream?: false;
    },
  ): Promise<ProgressResponse>;
  pull(
    request: PullRequest & {
      stream: true;
    },
  ): Promise<AsyncGenerator<ProgressResponse>>;
  pull(
    request: PullRequest & {
      stream?: false;
    },
  ): Promise<ProgressResponse>;
  push(
    request: PushRequest & {
      stream: true;
    },
  ): Promise<AsyncGenerator<ProgressResponse>>;
  push(
    request: PushRequest & {
      stream?: false;
    },
  ): Promise<ProgressResponse>;
  delete(request: DeleteRequest): Promise<StatusResponse>;
  copy(request: CopyRequest): Promise<StatusResponse>;
  list(): Promise<ListResponse>;
  show(request: ShowRequest): Promise<ShowResponse>;
  embeddings(request: EmbeddingsRequest): Promise<EmbeddingsResponse>;
}
declare const _default: Ollama;

export {
  Ollama,
  _default as default,
  type ChatRequest,
  type ChatResponse,
  type Config,
  type CopyRequest,
  type CreateRequest,
  type DeleteRequest,
  type EmbeddingsRequest,
  type EmbeddingsResponse,
  type ErrorResponse,
  type Fetch,
  type GenerateRequest,
  type GenerateResponse,
  type ListResponse,
  type Message,
  type ModelDetails,
  type ModelResponse,
  type Options,
  type ProgressResponse,
  type PullRequest,
  type PushRequest,
  type ShowRequest,
  type ShowResponse,
  type StatusResponse,
};
