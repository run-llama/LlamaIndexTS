export abstract class _BaseGradientLLM {
  protected model: string;

  constructor(model: string) {
    this.model = model;
  }

  async initialize(): Promise<void> {
    // Code to initialize the model
  }
  
  async close(): Promise<void> {
    // Code to close the model
  }
  
  async completePrompt(prompt: string): Promise<string> {
    // Code to complete the prompt using the model
    return '';
  }
}

export class GradientBaseModelLLM extends _BaseGradientLLM {
  private baseModelSlug: string;

  constructor(model: string, baseModelSlug: string) {
    super(model);
    this.baseModelSlug = baseModelSlug;
  }

  // Removed methods as they are already defined in the parent class
}

export class GradientModelAdapterLLM extends _BaseGradientLLM {
  private adapter: any;

  constructor(model: string, adapter: any) {
    super(model);
    this.adapter = adapter;
  }

  // Removed methods as they are already defined in the parent class

  async completePrompt(prompt: string) {
    // Code to complete the prompt using the model and the adapter
    return '';
  }
}
