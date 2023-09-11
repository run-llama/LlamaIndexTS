import axios from 'axios';

class HuggingFacesTextGeneration {
  private apiEndpoint: string;

  constructor(apiEndpoint: string) {
    this.apiEndpoint = apiEndpoint;
  }

  async sendRequest(prompt: string) {
    const response = await axios.post(this.apiEndpoint, {
      prompt: prompt,
    });
    return this.receiveResponse(response);
  }

  receiveResponse(response: any) {
    if (response.status !== 200) {
      throw new Error(`Unexpected response code: ${response.status}`);
    }
    return response.data;
  }
}

export default HuggingFacesTextGeneration;
