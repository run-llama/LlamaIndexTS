export abstract class _BaseGradientLLM {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  abstract initialize(): Promise<void>;
  abstract close(): Promise<void>;
  abstract completePrompt(prompt: string): Promise<string>;
}

export class GradientBaseModelLLM extends _BaseGradientLLM {
  private baseModelSlug: string;

  constructor(model: any, baseModelSlug: string) {
    super(model);
    this.baseModelSlug = baseModelSlug;
  }

  async initialize() {
    // Initialize the model based on the baseModelSlug
  }

  async close() {
    // Close the model
  }

  async completePrompt(prompt: string) {
    // Complete the prompt using the model
    return '';
  }
}

export class GradientModelAdapterLLM extends _BaseGradientLLM {
  private adapter: any;

  constructor(model: any, adapter: any) {
    super(model);
    this.adapter = adapter;
  }

  async initialize() {
    // Initialize the model using the adapter
  }

  async close() {
    // Close the model using the adapter
  }

  async completePrompt(prompt: string) {
    // Complete the prompt using the model and the adapter
    return '';
  }
}
