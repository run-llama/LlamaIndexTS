const { GradientBaseModelLLM, GradientModelAdapterLLM } = require('../llm/gradient');

describe('GradientBaseModelLLM', () => {
  it('should initialize the model', async () => {
    const model = new GradientBaseModelLLM('model', 'baseModelSlug');
    await model.initialize();
    // Add assertions here
  });

  it('should close the model', async () => {
    const model = new GradientBaseModelLLM('model', 'baseModelSlug');
    await model.close();
    // Add assertions here
  });

  it('should complete the prompt', async () => {
    const model = new GradientBaseModelLLM('model', 'baseModelSlug');
    const result = await model.completePrompt('prompt');
    // Add assertions here
  });
});

describe('GradientModelAdapterLLM', () => {
  it('should initialize the model', async () => {
    const model = new GradientModelAdapterLLM('model', {});
    await model.initialize();
    // Add assertions here
  });

  it('should close the model', async () => {
    const model = new GradientModelAdapterLLM('model', {});
    await model.close();
    // Add assertions here
  });

  it('should complete the prompt', async () => {
    const model = new GradientModelAdapterLLM('model', {});
    const result = await model.completePrompt('prompt');
    // Add assertions here
  });
});
