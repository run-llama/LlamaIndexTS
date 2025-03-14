/**
 * An OutputParser is used to extract structured data from the raw output of the LLM.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BaseOutputParser<T = any> {
  parse(output: string): T;

  format(output: string): string;
}
