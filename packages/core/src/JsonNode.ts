import { Node } from './Node';

export class JsonNode extends Node {
  private jsonData: object;

  constructor(jsonData: object) {
    super();
    this.jsonData = jsonData;
  }

  getContent(): string {
    return JSON.stringify(this.jsonData);
  }
}

