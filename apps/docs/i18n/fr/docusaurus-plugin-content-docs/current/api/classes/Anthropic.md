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

[packages/core/src/llm/LLM.ts:667](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L667)

## Properties

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[packages/core/src/llm/LLM.ts:660](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L660)

---

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[packages/core/src/llm/LLM.ts:665](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L665)

---

### hasStreaming

• **hasStreaming**: `boolean` = `true`

#### Implementation of

[LLM](../interfaces/LLM.md).[hasStreaming](../interfaces/LLM.md#hasstreaming)

#### Defined in

[packages/core/src/llm/LLM.ts:651](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L651)

---

### maxRetries

• **maxRetries**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:661](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L661)

---

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:657](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L657)

---

### model

• **model**: `"claude-2"` \| `"claude-instant-1"`

#### Defined in

[packages/core/src/llm/LLM.ts:654](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L654)

---

### session

• **session**: `AnthropicSession`

#### Defined in

[packages/core/src/llm/LLM.ts:663](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L663)

---

### temperature

• **temperature**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:655](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L655)

---

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:662](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L662)

---

### topP

• **topP**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:656](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L656)

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

[packages/core/src/llm/LLM.ts:691](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L691)

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

[packages/core/src/llm/LLM.ts:719](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L719)

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

[packages/core/src/llm/LLM.ts:776](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L776)

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

[packages/core/src/llm/LLM.ts:702](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L702)

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

[packages/core/src/llm/LLM.ts:751](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L751)

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

[packages/core/src/llm/LLM.ts:794](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L794)

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

[packages/core/src/llm/LLM.ts:687](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/llm/LLM.ts#L687)
