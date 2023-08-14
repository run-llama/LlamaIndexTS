import { Document } from './Document';

export class JsonDocument extends Document {
  private jsonData: object;

  constructor(jsonData: object) {
    super();
    this.jsonData = jsonData;
  }

  getContent(): string {
    return JSON.stringify(this.jsonData);
  }
}

