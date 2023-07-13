---
id: "CondenseQuestionChatEngine"
title: "Class: CondenseQuestionChatEngine"
sidebar_label: "CondenseQuestionChatEngine"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- `ChatEngine`

## Constructors

### constructor

• **new CondenseQuestionChatEngine**(`init`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | `Object` |
| `init.chatHistory` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `init.condenseMessagePrompt?` | [`SimplePrompt`](../modules.md#simpleprompt) |
| `init.queryEngine` | `BaseQueryEngine` |
| `init.serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Defined in

[ChatEngine.ts:57](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L57)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[ChatEngine.ts:53](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L53)

___

### condenseMessagePrompt

• **condenseMessagePrompt**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ChatEngine.ts:55](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L55)

___

### queryEngine

• **queryEngine**: `BaseQueryEngine`

#### Defined in

[ChatEngine.ts:52](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L52)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ChatEngine.ts:54](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L54)

## Methods

### achat

▸ **achat**(`message`, `chatHistory?`): `Promise`<[`Response`](Response.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `chatHistory?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

ChatEngine.achat

#### Defined in

[ChatEngine.ts:86](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L86)

___

### acondenseQuestion

▸ `Private` **acondenseQuestion**(`chatHistory`, `question`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chatHistory` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `question` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[ChatEngine.ts:71](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L71)

___

### chatRepl

▸ **chatRepl**(): `void`

#### Returns

`void`

#### Implementation of

ChatEngine.chatRepl

#### Defined in

[ChatEngine.ts:105](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L105)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Implementation of

ChatEngine.reset

#### Defined in

[ChatEngine.ts:109](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L109)
