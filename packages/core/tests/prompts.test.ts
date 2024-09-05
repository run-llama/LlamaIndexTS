import { describe, test, expectTypeOf, expect } from 'vitest';
import { PromptTemplate, type StringTemplate } from '@llamaindex/core/prompts';
import type { BaseOutputParser } from '@llamaindex/core/schema';

describe('type system', () => {
	test('StringTemplate', () => {
		{
			type Test = StringTemplate<['var1', 'var2']>
			expectTypeOf<'{var1}{var2}'>().toMatchTypeOf<Test>();
			expectTypeOf<'{var1}'>().not.toMatchTypeOf<Test>();
			expectTypeOf<'{var1} var2'>().not.toMatchTypeOf<Test>();
			expectTypeOf<'{var2}{var1}'>().toMatchTypeOf<Test>();
		}
		{
			const arr = ['var1', 'var2'] as const;
			type Test = StringTemplate<typeof arr>
			expectTypeOf<'{var1}{var2}'>().toMatchTypeOf<Test>();
			expectTypeOf<'{var1}'>().not.toMatchTypeOf<Test>();
			expectTypeOf<'{var1} var2'>().not.toMatchTypeOf<Test>();
			expectTypeOf<'{var2}{var1}'>().toMatchTypeOf<Test>();
		}
		{
			const template = `Act as a natural language processing software. Analyze the given text and return me only a parsable and minified JSON object.


Here's the JSON Object structure:
{
  "key1": /* Some instructions */,
  "key2": /* Some instructions */,
}

Here are the rules you must follow:
- You MUST return a valid, parsable JSON object.
- More rules…

Here are some examples to help you out:
- Example 1…
- Example 2…

Text: {selection}

JSON Data:` as const;
			type Test = StringTemplate<['selection']>
			expectTypeOf(template).toMatchTypeOf<Test>();
		}
	});

	test('PromptTemplate', () => {
		{
			new PromptTemplate(
				{
					// @ts-expect-error
					template: '',
					templateVars: ['var1']
				}
			);
		}
		{
			new PromptTemplate(
				{
					template: 'something{var1}',
					templateVars: ['var1']
				}
			);
		}
		{
			new PromptTemplate(
				{
					// @ts-expect-error
					template: '{var1 }',
					templateVars: ['var1']
				}
			);
		}
		{
			// in this case, type won't be inferred
			const template = '{var2}';
			const templateVars = ['var1'];
			new PromptTemplate(
				{
					template,
					templateVars
				}
			);
		}
		{
			const template = '{var2}' as const;
			const templateVars = ['var1'] as const;
			new PromptTemplate(
				{
					// @ts-expect-error
					template,
					templateVars
				}
			);
		}
		{
			const prompt = new PromptTemplate({
				template: 'hello {text} {foo}',
				templateVars: ['text', 'foo']
			});

			prompt.partialFormat({
				foo: 'bar',
				// @ts-expect-error
				goo: 'baz'
			});
		}
	});
});

describe('PromptTemplate', () => {
	test('basic usage', () => {
		{
			const template = 'hello {text} {foo}';
			const prompt = new PromptTemplate({
				template
			});
			const partialPrompt = prompt.partialFormat({
				foo: 'bar'
			});
			expect(partialPrompt).instanceof(PromptTemplate);
			expect(partialPrompt.format({
				text: 'world'
			})).toBe('hello world bar');
		}
	});
	test('should partially format and fully format a prompt', () => {
		const prompt = new PromptTemplate({
			template: 'hello {text} {foo}',
			templateVars: ['text', 'foo']
		});

		const partialPrompt = prompt.partialFormat({ foo: 'bar' });
		expect(partialPrompt).toBeInstanceOf(PromptTemplate);
		expect(partialPrompt.format({ text: 'world' })).toBe('hello world bar');
	});

	test('should use output parser in formatting', () => {
		const outputParser: BaseOutputParser = {
			parse(output: string) {
				return { output: output };
			},

			format(query: string) {
				return `${query}\noutput_instruction`;
			}
		}

		const prompt = new PromptTemplate({
			template: 'hello {text} {foo}',
			templateVars: ['text', 'foo'],
			outputParser: outputParser
		});

		const formatted = prompt.format({ text: 'world', foo: 'bar' });
		expect(formatted).toBe('hello world bar\noutput_instruction');
	});
});