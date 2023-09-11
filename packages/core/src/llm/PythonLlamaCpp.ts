import axios from 'axios';

class PythonLlamaCpp {
  private apiURL: string;

  constructor(apiURL: string) {
    this.apiURL = apiURL;
  }

  async sendRequest(prompt: string) {
    const response = await axios.post(this.apiURL, {
      prompt: prompt
    });
    return response.data;
  }

  async receiveResponse() {
    const response = await axios.get(this.apiURL);
    return response.data;
  }
}

export default PythonLlamaCpp;
