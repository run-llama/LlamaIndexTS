---
id: "LLM"
title: "Interface: LLM"
sidebar_label: "LLM"
sidebar_position: 0
custom_edit_url: null
---

Unified language model interface

## Implemented by

- [`Anthropic`](../classes/Anthropic.md)
- [`LlamaDeuce`](../classes/LlamaDeuce.md)
- [`OpenAI`](../classes/OpenAI.md)
- [`Portkey`](../classes/Portkey.md)

## Properties

### hasStreaming

• **hasStreaming**: `boolean`

#### Defined in

[packages/core/src/llm/LLM.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L68)

---

### metadata

• **metadata**: [`LLMMetadata`](LLMMetadata.md)

#### Defined in

[packages/core/src/llm/LLM.ts:66](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L66)

## Methods

### chat

▸ **chat**<`T`, `R`\>(`messages`, `parentEvent?`, `streaming?`): `Promise`<`R`\>

Get a chat response from the LLM

#### Type parameters

| Name | Type                                                                                                    |
| :--- | :------------------------------------------------------------------------------------------------------ |
| `T`  | extends `undefined` \| `boolean` = `undefined`                                                          |
| `R`  | `T` extends `true` ? `AsyncGenerator`<`string`, `void`, `unknown`\> : [`ChatResponse`](ChatResponse.md) |

#### Parameters

| Name           | Type                              | Description                                                                                      |
| :------------- | :-------------------------------- | :----------------------------------------------------------------------------------------------- |
| `messages`     | [`ChatMessage`](ChatMessage.md)[] | The return type of chat() and complete() are set by the "streaming" parameter being set to True. |
| `parentEvent?` | [`Event`](Event.md)               | -                                                                                                |
| `streaming?`   | `T`                               | -                                                                                                |

#### Returns

`Promise`<`R`\>

#### Defined in

[packages/core/src/llm/LLM.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L75)

---

### complete

▸ **complete**<`T`, `R`\>(`prompt`, `parentEvent?`, `streaming?`): `Promise`<`R`\>

Get a prompt completion from the LLM

#### Type parameters

| Name | Type                                                                                                    |
| :--- | :------------------------------------------------------------------------------------------------------ |
| `T`  | extends `undefined` \| `boolean` = `undefined`                                                          |
| `R`  | `T` extends `true` ? `AsyncGenerator`<`string`, `void`, `unknown`\> : [`ChatResponse`](ChatResponse.md) |

#### Parameters

| Name           | Type                | Description            |
| :------------- | :------------------ | :--------------------- |
| `prompt`       | `string`            | the prompt to complete |
| `parentEvent?` | [`Event`](Event.md) | -                      |
| `streaming?`   | `T`                 | -                      |

#### Returns

`Promise`<`R`\>

#### Defined in

[packages/core/src/llm/LLM.ts:88](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L88)

---

### tokens

▸ **tokens**(`messages`): `number`

Calculates the number of tokens needed for the given chat messages

#### Parameters

| Name       | Type                              |
| :--------- | :-------------------------------- |
| `messages` | [`ChatMessage`](ChatMessage.md)[] |

#### Returns

`number`

#### Defined in

[packages/core/src/llm/LLM.ts:100](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L100)
