---
id: "SimpleResponseBuilder"
title: "Class: SimpleResponseBuilder"
sidebar_label: "SimpleResponseBuilder"
sidebar_position: 0
custom_edit_url: null
---

A response builder that just concatenates responses.

## Implements

- `BaseResponseBuilder`

## Constructors

### constructor

• **new SimpleResponseBuilder**(`serviceContext`)

#### Parameters

| Name             | Type                                                |
| :--------------- | :-------------------------------------------------- |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:53](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ResponseSynthesizer.ts#L53)

## Properties

### llm

• **llm**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ResponseSynthesizer.ts#L50)

---

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../#simpleprompt)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ResponseSynthesizer.ts#L51)

## Methods

### getResponse

▸ **getResponse**(`query`, `textChunks`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `query`        | `string`                          |
| `textChunks`   | `string`[]                        |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Implementation of

BaseResponseBuilder.getResponse

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ResponseSynthesizer.ts#L58)
