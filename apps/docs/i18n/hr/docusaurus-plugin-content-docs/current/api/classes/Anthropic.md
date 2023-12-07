---
id: "Anthropic"
title: "Class: Anthropic"
sidebar_label: "Anthropic"
sidebar_position: 0
custom_edit_url: null
---

Anthropic LLM implementation

## Implements

- [`LLM`](../interfaces/LLM.md)

## Constructors

### constructor

• **new Anthropic**(`init?`)

#### Parameters

| Name    | Type                                    |
| :------ | :-------------------------------------- |
| `init?` | `Partial`<[`Anthropic`](Anthropic.md)\> |

#### Defined in

[packages/core/src/llm/LLM.ts:669](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L669)

## Properties

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[packages/core/src/llm/LLM.ts:662](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L662)

---

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[packages/core/src/llm/LLM.ts:667](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L667)

---

### hasStreaming

• **hasStreaming**: `boolean` = `true`

#### Implementation of

[LLM](../interfaces/LLM.md).[hasStreaming](../interfaces/LLM.md#hasstreaming)

#### Defined in

[packages/core/src/llm/LLM.ts:653](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L653)

---

### maxRetries

• **maxRetries**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:663](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L663)

---

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:659](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L659)

---

### model

• **model**: `"claude-2"` \| `"claude-instant-1"`

#### Defined in

[packages/core/src/llm/LLM.ts:656](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L656)

---

### session

• **session**: `AnthropicSession`

#### Defined in

[packages/core/src/llm/LLM.ts:665](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L665)

---

### temperature

• **temperature**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:657](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L657)

---

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:664](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L664)

---

### topP

• **topP**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:658](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L658)

## Accessors

### metadata

• `get` **metadata**(): `Object`

#### Returns

`Object`

| Name            | Type                                 |
| :-------------- | :----------------------------------- |
| `contextWindow` | `number`                             |
| `maxTokens`     | `undefined` \| `number`              |
| `model`         | `"claude-2"` \| `"claude-instant-1"` |
| `temperature`   | `number`                             |
| `tokenizer`     | `undefined`                          |
| `topP`          | `number`                             |

#### Implementation of

[LLM](../interfaces/LLM.md).[metadata](../interfaces/LLM.md#metadata)

#### Defined in

[packages/core/src/llm/LLM.ts:693](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L693)

## Methods

### chat

▸ **chat**<`T`, `R`\>(`messages`, `parentEvent?`, `streaming?`): `Promise`<`R`\>

Get a chat response from the LLM

#### Type parameters

| Name | Type                                                                                                                  |
| :--- | :-------------------------------------------------------------------------------------------------------------------- |
| `T`  | extends `undefined` \| `boolean` = `undefined`                                                                        |
| `R`  | `T` extends `true` ? `AsyncGenerator`<`string`, `void`, `unknown`\> : [`ChatResponse`](../interfaces/ChatResponse.md) |

#### Parameters

| Name           | Type                                            | Description                                                                                      |
| :------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| `messages`     | [`ChatMessage`](../interfaces/ChatMessage.md)[] | The return type of chat() and complete() are set by the "streaming" parameter being set to True. |
| `parentEvent?` | [`Event`](../interfaces/Event.md)               | -                                                                                                |
| `streaming?`   | `T`                                             | -                                                                                                |

#### Returns

`Promise`<`R`\>

#### Implementation of

[LLM](../interfaces/LLM.md).[chat](../interfaces/LLM.md#chat)

#### Defined in

[packages/core/src/llm/LLM.ts:721](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L721)

---

### complete

▸ **complete**<`T`, `R`\>(`prompt`, `parentEvent?`, `streaming?`): `Promise`<`R`\>

Get a prompt completion from the LLM

#### Type parameters

| Name | Type                                                                                                                  |
| :--- | :-------------------------------------------------------------------------------------------------------------------- |
| `T`  | extends `undefined` \| `boolean` = `undefined`                                                                        |
| `R`  | `T` extends `true` ? `AsyncGenerator`<`string`, `void`, `unknown`\> : [`ChatResponse`](../interfaces/ChatResponse.md) |

#### Parameters

| Name           | Type                              | Description            |
| :------------- | :-------------------------------- | :--------------------- |
| `prompt`       | `string`                          | the prompt to complete |
| `parentEvent?` | [`Event`](../interfaces/Event.md) | -                      |
| `streaming?`   | `T`                               | -                      |

#### Returns

`Promise`<`R`\>

#### Implementation of

[LLM](../interfaces/LLM.md).[complete](../interfaces/LLM.md#complete)

#### Defined in

[packages/core/src/llm/LLM.ts:778](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L778)

---

### mapMessagesToPrompt

▸ **mapMessagesToPrompt**(`messages`): `string`

#### Parameters

| Name       | Type                                            |
| :--------- | :---------------------------------------------- |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`string`

#### Defined in

[packages/core/src/llm/LLM.ts:704](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L704)

---

### streamChat

▸ `Protected` **streamChat**(`messages`, `parentEvent?`): `AsyncGenerator`<`string`, `void`, `unknown`\>

#### Parameters

| Name           | Type                                            |
| :------------- | :---------------------------------------------- |
| `messages`     | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md)               |

#### Returns

`AsyncGenerator`<`string`, `void`, `unknown`\>

#### Defined in

[packages/core/src/llm/LLM.ts:753](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L753)

---

### streamComplete

▸ `Protected` **streamComplete**(`prompt`, `parentEvent?`): `AsyncGenerator`<`string`, `void`, `unknown`\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `prompt`       | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`AsyncGenerator`<`string`, `void`, `unknown`\>

#### Defined in

[packages/core/src/llm/LLM.ts:796](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L796)

---

### tokens

▸ **tokens**(`messages`): `number`

Calculates the number of tokens needed for the given chat messages

#### Parameters

| Name       | Type                                            |
| :--------- | :---------------------------------------------- |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`number`

#### Implementation of

[LLM](../interfaces/LLM.md).[tokens](../interfaces/LLM.md#tokens)

#### Defined in

[packages/core/src/llm/LLM.ts:689](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L689)
