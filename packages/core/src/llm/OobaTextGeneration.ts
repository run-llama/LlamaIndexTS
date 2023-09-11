import axios from 'axios';

class OobaTextGeneration {
  private apiURL: string;

  constructor(apiURL: string) {
    this.apiURL = apiURL;
  }

  async sendRequest(input: string): Promise<string> {
    try {
      const response = await axios.post(this.apiURL, { text: input });
      return response.data;
    } catch (error) {
      console.error(`Error sending request to Ooba Text Generation API: ${error}`);
      throw error;
    }
  }
}

export default OobaTextGeneration;
