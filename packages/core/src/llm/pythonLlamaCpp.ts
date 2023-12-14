import { LlamaCpp } from 'node-llama-cpp';

export class PythonLlamaCpp {
  private llamaCpp: LlamaCpp;

  constructor(apiKey: string) {
    this.llamaCpp = new LlamaCpp(apiKey);
  }

  async request(query: string) {
    try {
      const response = await this.llamaCpp.complete(query);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error making request to python llama cpp API:', error);
      throw error;
    }
  }

  handleResponse(response: any) {
    // Process the response from the API
    // This will depend on the structure of the response
    return response;
  }
}
