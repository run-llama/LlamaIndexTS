import format from "python-format-js";
import type { ChatMessage } from "../llms";
import type { BaseOutputParser, Metadata } from "../schema";
import { objectEntries } from "../utils";
import { PromptType } from "./prompt-type";

type MappingFn<TemplatesVar extends string[] = string[]> = (
  options: Record<TemplatesVar[number], string>,
) => string;

export type BasePromptTemplateOptions<
  TemplatesVar extends readonly string[],
  Vars extends readonly string[],
> = {
  metadata?: Metadata;
  templateVars?:
    | TemplatesVar
    // loose type for better type inference
    | readonly string[];
  options?: Partial<Record<TemplatesVar[number], string>>;
  outputParser?: BaseOutputParser;
  templateVarMappings?: Partial<Record<Vars[number], TemplatesVar[number]>>;
  functionMappings?: Partial<Record<TemplatesVar[number], MappingFn>>;
};

export abstract class BasePromptTemplate<
  const TemplatesVar extends readonly string[] = string[],
  const Vars extends readonly string[] = string[],
> {
  metadata: Metadata = {};
  templateVars: Set<string> = new Set();
  options: Partial<Record<TemplatesVar[number], string>> = {};
  outputParser?: BaseOutputParser;
  templateVarMappings: Partial<Record<Vars[number], TemplatesVar[number]>> = {};
  functionMappings: Partial<Record<TemplatesVar[number], MappingFn>> = {};

  protected constructor(
    options: BasePromptTemplateOptions<TemplatesVar, Vars>,
  ) {
    const {
      metadata,
      templateVars,
      outputParser,
      templateVarMappings,
      functionMappings,
    } = options;
    if (metadata) {
      this.metadata = metadata;
    }
    if (templateVars) {
      this.templateVars = new Set(templateVars);
    }
    if (options.options) {
      this.options = options.options;
    }
    this.outputParser = outputParser;
    if (templateVarMappings) {
      this.templateVarMappings = templateVarMappings;
    }
    if (functionMappings) {
      this.functionMappings = functionMappings;
    }
  }

  protected mapTemplateVars(options: Record<TemplatesVar[number], string>) {
    const templateVarMappings = this.templateVarMappings;
    return Object.fromEntries(
      objectEntries(options).map(([k, v]) => [templateVarMappings[k] || k, v]),
    );
  }

  protected mapFunctionVars(options: Record<TemplatesVar[number], string>) {
    const functionMappings = this.functionMappings;
    const newOptions = {} as Record<TemplatesVar[number], string>;
    for (const [k, v] of objectEntries(functionMappings)) {
      newOptions[k] = v!(options);
    }

    for (const [k, v] of objectEntries(options)) {
      if (!(k in newOptions)) {
        newOptions[k] = v;
      }
    }

    return newOptions;
  }

  protected mapAllVars(
    options: Record<TemplatesVar[number], string>,
  ): Record<string, string> {
    const newOptions = this.mapFunctionVars(options);
    return this.mapTemplateVars(newOptions);
  }

  abstract partialFormat(
    options: Partial<Record<TemplatesVar[number], string>>,
  ): BasePromptTemplate<TemplatesVar, Vars>;

  abstract format(
    options?: Partial<Record<TemplatesVar[number], string>>,
  ): string;

  abstract formatMessages(
    options?: Partial<Record<TemplatesVar[number], string>>,
  ): ChatMessage[];

  abstract get template(): string;
}

type Permutation<T, K=T> =
  [T] extends [never]
    ? []
    : K extends K
      ? [K, ...Permutation<Exclude<T, K>>]
      : never;

type Join<T extends any[], U extends string> = T extends [infer F, ...infer R]
  ? R['length'] extends 0
    ? `${F & string}`
    : `${F & string}${U}${Join<R, U>}`
  : never

type WrapStringWithBracket<T extends string> = `{${T}}`

export type StringTemplate<Var extends readonly string[]> = `${string}${Join<Permutation<WrapStringWithBracket<Var[number]>>, `${string}`>}${string}`

export type PromptTemplateOptions<
  TemplatesVar extends readonly string[],
  Vars extends readonly string[],
  Template extends StringTemplate<TemplatesVar>,
> = BasePromptTemplateOptions<TemplatesVar, Vars> & {
  template: Template;
  promptType?: PromptType;
};

export class PromptTemplate<
  const TemplatesVar extends readonly string[] = string[],
  const Vars extends readonly string[] = string[],
  const Template extends StringTemplate<TemplatesVar> = StringTemplate<TemplatesVar>,
> extends BasePromptTemplate<TemplatesVar, Vars> {
  #template: Template;
  promptType: PromptType;

  constructor(options: PromptTemplateOptions<TemplatesVar, Vars, Template>) {
    const { template, promptType, ...rest } = options;
    super(rest);
    this.#template = template;
    this.promptType = promptType ?? PromptType.custom;
  }

  partialFormat(
    options: Partial<Record<TemplatesVar[number], string>>,
  ): PromptTemplate<TemplatesVar, Vars, Template> {
    const prompt = new PromptTemplate({
      template: this.template,
      templateVars: [...this.templateVars],
      options: this.options,
      outputParser: this.outputParser,
      templateVarMappings: this.templateVarMappings,
      functionMappings: this.functionMappings,
      metadata: this.metadata,
      promptType: this.promptType,
    });

    prompt.options = {
      ...prompt.options,
      ...options,
    };

    return prompt;
  }

  format(options?: Partial<Record<TemplatesVar[number], string>>): string {
    const allOptions = {
      ...this.options,
      ...options,
    } as Record<TemplatesVar[number], string>;

    const mappedAllOptions = this.mapAllVars(allOptions);

    const prompt = format(this.template, mappedAllOptions);

    if (this.outputParser) {
      return this.outputParser.format(prompt);
    }
    return prompt;
  }

  formatMessages(
    options?: Partial<Record<TemplatesVar[number], string>>,
  ): ChatMessage[] {
    const prompt = this.format(options);
    return [
      {
        role: "user",
        content: prompt,
      },
    ];
  }

  get template(): Template {
    return this.#template;
  }
}
