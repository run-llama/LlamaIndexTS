---
id: "OpenAI"
title: "Class: OpenAI"
sidebar_label: "OpenAI"
sidebar_position: 0
custom_edit_url: null
---

OpenAI LLM implementation

## Implements

- [`LLM`](../interfaces/LLM.md)

## Constructors

### constructor

• **new OpenAI**(`init?`)

#### Parameters

| Name    | Type                                                                  |
| :------ | :-------------------------------------------------------------------- |
| `init?` | `Partial`<[`OpenAI`](OpenAI.md)\> & { `azure?`: `AzureOpenAIConfig` } |

#### Defined in

[packages/core/src/llm/LLM.ts:152](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L152)

## Properties

### additionalChatOptions

• `Optional` **additionalChatOptions**: `Omit`<`Partial`<`ChatCompletionCreateParams`\>, `"model"` \| `"temperature"` \| `"max_tokens"` \| `"messages"` \| `"top_p"` \| `"streaming"`\>

#### Defined in

[packages/core/src/llm/LLM.ts:135](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L135)

---

### additionalSessionOptions

• `Optional` **additionalSessionOptions**: `Omit`<`Partial`<`ClientOptions`\>, `"apiKey"` \| `"timeout"` \| `"maxRetries"`\>

#### Defined in

[packages/core/src/llm/LLM.ts:145](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L145)

---

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[packages/core/src/llm/LLM.ts:141](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L141)

---

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[packages/core/src/llm/LLM.ts:150](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L150)

---

### hasStreaming

• **hasStreaming**: `boolean` = `true`

#### Implementation of

[LLM](../interfaces/LLM.md).[hasStreaming](../interfaces/LLM.md#hasstreaming)

#### Defined in

[packages/core/src/llm/LLM.ts:128](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L128)

---

### maxRetries

• **maxRetries**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:142](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L142)

---

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L134)

---

### model

• **model**: `"gpt-3.5-turbo"` \| `"gpt-3.5-turbo-1106"` \| `"gpt-3.5-turbo-16k"` \| `"gpt-4"` \| `"gpt-4-32k"` \| `"gpt-4-1106-preview"` \| `"gpt-4-vision-preview"`

#### Defined in

[packages/core/src/llm/LLM.ts:131](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L131)

---

### session

• **session**: `OpenAISession`

#### Defined in

[packages/core/src/llm/LLM.ts:144](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L144)

---

### temperature

• **temperature**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:132](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L132)

---

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:143](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L143)

---

### topP

• **topP**: `number`

#### Defined in

[packages/core/src/llm/LLM.ts:133](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L133)

## Accessors

### metadata

• `get` **metadata**(): `Object`

#### Returns

`Object`

| Name            | Type                                                                                                                                                     |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contextWindow` | `number`                                                                                                                                                 |
| `maxTokens`     | `undefined` \| `number`                                                                                                                                  |
| `model`         | `"gpt-3.5-turbo"` \| `"gpt-3.5-turbo-1106"` \| `"gpt-3.5-turbo-16k"` \| `"gpt-4"` \| `"gpt-4-32k"` \| `"gpt-4-1106-preview"` \| `"gpt-4-vision-preview"` |
| `temperature`   | `number`                                                                                                                                                 |
| `tokenizer`     | [`CL100K_BASE`](../enums/Tokenizers.md#cl100k_base)                                                                                                      |
| `topP`          | `number`                                                                                                                                                 |

#### Implementation of

[LLM](../interfaces/LLM.md).[metadata](../interfaces/LLM.md#metadata)

#### Defined in

[packages/core/src/llm/LLM.ts:206](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L206)

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

[packages/core/src/llm/LLM.ts:249](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L249)

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

[packages/core/src/llm/LLM.ts:286](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L286)

---

### mapMessageType

▸ **mapMessageType**(`messageType`): `"function"` \| `"user"` \| `"assistant"` \| `"system"`

#### Parameters

| Name          | Type                             |
| :------------ | :------------------------------- |
| `messageType` | [`MessageType`](../#messagetype) |

#### Returns

`"function"` \| `"user"` \| `"assistant"` \| `"system"`

#### Defined in

[packages/core/src/llm/LLM.ts:232](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L232)

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

[packages/core/src/llm/LLM.ts:300](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L300)

---

### streamComplete

▸ `Protected` **streamComplete**(`query`, `parentEvent?`): `AsyncGenerator`<`string`, `void`, `unknown`\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `query`        | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`AsyncGenerator`<`string`, `void`, `unknown`\>

#### Defined in

[packages/core/src/llm/LLM.ts:362](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L362)

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

[packages/core/src/llm/LLM.ts:217](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L217)
