import { Node } from './Node';

export class Document extends Node {
  private text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  getContent(): string {
    return this.text;
  }
}

