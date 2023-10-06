import axios from 'axios';

export class OobaTextGeneration {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string) {
    const response = await axios.post('https://api.ooba.ai/generate', {
      prompt,
      apiKey: this.apiKey,
    });

    return response.data;
  }
}
