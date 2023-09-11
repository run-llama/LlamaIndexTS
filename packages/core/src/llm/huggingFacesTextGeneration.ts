import axios from 'axios';

class HuggingFacesTextGeneration {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string) {
    const response = await axios.post(
      'https://api.huggingface.co/text-generation',
      {
        prompt,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      },
    );

    return response.data;
  }
}

export default HuggingFacesTextGeneration;
