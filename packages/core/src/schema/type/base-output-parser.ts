/**
 * An OutputParser is used to extract structured data from the raw output of the LLM.
 */
export interface BaseOutputParser {
  parse(output: string): any;

  format(output: string): string;
}
