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
    // Replace with actual code to initialize the model based on the baseModelSlug
  }

  async close() {
    // Replace with actual code to close the model
  }

  async completePrompt(prompt: string) {
    // Replace with actual code to complete the prompt using the model
    return '';
  }
}

export class GradientModelAdapterLLM extends _BaseGradientLLM {
  private adapter: AdapterType; // Replace AdapterType with the actual type

  constructor(model: string, adapter: AdapterType) {
    super(model);
    this.adapter = adapter;
  }

  async initialize() {
    // Replace with actual code to initialize the model using the adapter
  }

  async close() {
    // Replace with actual code to close the model using the adapter
  }

  async completePrompt(prompt: string) {
    // Replace with actual code to complete the prompt using the model and the adapter
    return '';
  }

  async completePrompt(prompt: string) {
    // Code to complete the prompt using the model and the adapter
    return '';
  }
}
