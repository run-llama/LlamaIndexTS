export abstract class _BaseGradientLLM {
  protected model: string;

  constructor(model: string) {
    this.model = model;
  }

  abstract initialize(): Promise<void>;
  abstract close(): Promise<void>;
  abstract completePrompt(prompt: string): Promise<string>;
}

export class GradientBaseModelLLM extends _BaseGradientLLM {
  private baseModelSlug: string;

  constructor(model: string, baseModelSlug: string) {
    super(model);
    this.baseModelSlug = baseModelSlug;
  }

  async initialize() {
    // Code to initialize the model based on the baseModelSlug
  }

  async close() {
    // Code to close the model
  }

  async completePrompt(prompt: string) {
    // Code to complete the prompt using the model
    return '';
  }
}

export class GradientModelAdapterLLM extends _BaseGradientLLM {
  private adapter: any;

  constructor(model: string, adapter: any) {
    super(model);
    this.adapter = adapter;
  }

  async initialize() {
    // Code to initialize the model using the adapter
  }

  async close() {
    // Code to close the model using the adapter
  }

  async completePrompt(prompt: string) {
    // Code to complete the prompt using the model and the adapter
    return '';
  }
}
