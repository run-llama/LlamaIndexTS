---
id: "LlamaDeuce"
title: "Class: LlamaDeuce"
sidebar_label: "LlamaDeuce"
sidebar_position: 0
custom_edit_url: null
---

Llama2 LLM implementation

## Implements

- [`LLM`](../interfaces/LLM.md)

## Constructors

### constructor

• **new LlamaDeuce**(`init?`)

#### Parameters

| Name    | Type                                      |
| :------ | :---------------------------------------- |
| `init?` | `Partial`<[`LlamaDeuce`](LlamaDeuce.md)\> |

#### Defined in

[packages/core/src/llm/LLM.ts:436](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L436)

## Properties

### chatStrategy

• **chatStrategy**: [`DeuceChatStrategy`](../enums/DeuceChatStrategy.md)

#### Defined in

[packages/core/src/llm/LLM.ts:429](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L429)

---

### hasStreaming

• **hasStreaming**: `boolean`

#### Implementation of

[LLM](../interfaces/LLM.md).[hasStreaming](../interfaces/LLM.md#hasstreaming)

#### Defined in

[packages/core/src/llm/LLM.ts:434](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L434)

---

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:432](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L432)

---

### model

• **model**: `"Llama-2-70b-chat-old"` \| `"Llama-2-70b-chat-4bit"` \| `"Llama-2-13b-chat-old"` \| `"Llama-2-13b-chat-4bit"` \| `"Llama-2-7b-chat-old"` \| `"Llama-2-7b-chat-4bit"`

#### Defined in

[packages/core/src/llm/LLM.ts:428](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L428)

---

### replicateSession

• **replicateSession**: `ReplicateSession`

#### Defined in

[packages/core/src/llm/LLM.ts:433](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L433)

---

### temperature

• **temperature**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:430](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L430)

---

### topP

• **topP**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:431](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L431)

## Accessors

### metadata

• `get` **metadata**(): `Object`

#### Returns

`Object`

| Name            | Type                                                                                                                                                                  |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contextWindow` | `number`                                                                                                                                                              |
| `maxTokens`     | `undefined` \| `number`                                                                                                                                               |
| `model`         | `"Llama-2-70b-chat-old"` \| `"Llama-2-70b-chat-4bit"` \| `"Llama-2-13b-chat-old"` \| `"Llama-2-13b-chat-4bit"` \| `"Llama-2-7b-chat-old"` \| `"Llama-2-7b-chat-4bit"` |
| `temperature`   | `number`                                                                                                                                                              |
| `tokenizer`     | `undefined`                                                                                                                                                           |
| `topP`          | `number`                                                                                                                                                              |

#### Implementation of

[LLM](../interfaces/LLM.md).[metadata](../interfaces/LLM.md#metadata)

#### Defined in

[packages/core/src/llm/LLM.ts:456](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L456)

## Methods

### chat

▸ **chat**<`T`, `R`\>(`messages`, `_parentEvent?`, `streaming?`): `Promise`<`R`\>

Get a chat response from the LLM

#### Type parameters

| Name | Type                                                                                                                  |
| :--- | :-------------------------------------------------------------------------------------------------------------------- |
| `T`  | extends `undefined` \| `boolean` = `undefined`                                                                        |
| `R`  | `T` extends `true` ? `AsyncGenerator`<`string`, `void`, `unknown`\> : [`ChatResponse`](../interfaces/ChatResponse.md) |

#### Parameters

| Name            | Type                                            | Description                                                                                      |
| :-------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| `messages`      | [`ChatMessage`](../interfaces/ChatMessage.md)[] | The return type of chat() and complete() are set by the "streaming" parameter being set to True. |
| `_parentEvent?` | [`Event`](../interfaces/Event.md)               | -                                                                                                |
| `streaming?`    | `T`                                             | -                                                                                                |

#### Returns

`Promise`<`R`\>

#### Implementation of

[LLM](../interfaces/LLM.md).[chat](../interfaces/LLM.md#chat)

#### Defined in

[packages/core/src/llm/LLM.ts:594](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L594)

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

[packages/core/src/llm/LLM.ts:634](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L634)

---

### mapMessageTypeA16Z

▸ **mapMessageTypeA16Z**(`messageType`): `string`

#### Parameters

| Name          | Type                             |
| :------------ | :------------------------------- |
| `messageType` | [`MessageType`](../#messagetype) |

#### Returns

`string`

#### Defined in

[packages/core/src/llm/LLM.ts:503](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L503)

---

### mapMessagesToPrompt

▸ **mapMessagesToPrompt**(`messages`): `Object`

#### Parameters

| Name       | Type                                            |
| :--------- | :---------------------------------------------- |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`Object`

| Name           | Type     |
| :------------- | :------- |
| `prompt`       | `string` |
| `systemPrompt` | `any`    |

#### Defined in

[packages/core/src/llm/LLM.ts:467](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L467)

---

### mapMessagesToPromptA16Z

▸ **mapMessagesToPromptA16Z**(`messages`): `Object`

#### Parameters

| Name       | Type                                            |
| :--------- | :---------------------------------------------- |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`Object`

| Name           | Type        |
| :------------- | :---------- |
| `prompt`       | `string`    |
| `systemPrompt` | `undefined` |

#### Defined in

[packages/core/src/llm/LLM.ts:489](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L489)

---

### mapMessagesToPromptMeta

▸ **mapMessagesToPromptMeta**(`messages`, `opts?`): `Object`

#### Parameters

| Name                  | Type                                            |
| :-------------------- | :---------------------------------------------- |
| `messages`            | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `opts?`               | `Object`                                        |
| `opts.replicate4Bit?` | `boolean`                                       |
| `opts.withBos?`       | `boolean`                                       |
| `opts.withNewlines?`  | `boolean`                                       |

#### Returns

`Object`

| Name           | Type     |
| :------------- | :------- |
| `prompt`       | `string` |
| `systemPrompt` | `any`    |

#### Defined in

[packages/core/src/llm/LLM.ts:516](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L516)

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

[packages/core/src/llm/LLM.ts:452](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/llm/LLM.ts#L452)
