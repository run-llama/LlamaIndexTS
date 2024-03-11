---
id: "SubQuestionQueryEngine"
title: "Class: SubQuestionQueryEngine"
sidebar_label: "SubQuestionQueryEngine"
sidebar_position: 0
custom_edit_url: null
---

SubQuestionQueryEngine decomposes a question into subquestions and then

## Implements

- [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

## Constructors

### constructor

• **new SubQuestionQueryEngine**(`init`)

#### Parameters

| Name                       | Type                                                              |
| :------------------------- | :---------------------------------------------------------------- |
| `init`                     | `Object`                                                          |
| `init.queryEngineTools`    | [`QueryEngineTool`](../interfaces/QueryEngineTool.md)[]           |
| `init.questionGen`         | [`BaseQuestionGenerator`](../interfaces/BaseQuestionGenerator.md) |
| `init.responseSynthesizer` | [`ResponseSynthesizer`](ResponseSynthesizer.md)                   |

#### Defined in

[packages/core/src/QueryEngine.ts:89](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/QueryEngine.ts#L89)

## Properties

### metadatas

• **metadatas**: [`ToolMetadata`](../interfaces/ToolMetadata.md)[]

#### Defined in

[packages/core/src/QueryEngine.ts:87](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/QueryEngine.ts#L87)

---

### queryEngines

• **queryEngines**: `Record`<`string`, [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)\>

#### Defined in

[packages/core/src/QueryEngine.ts:86](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/QueryEngine.ts#L86)

---

### questionGen

• **questionGen**: [`BaseQuestionGenerator`](../interfaces/BaseQuestionGenerator.md)

#### Defined in

[packages/core/src/QueryEngine.ts:85](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/QueryEngine.ts#L85)

---

### responseSynthesizer

• **responseSynthesizer**: [`ResponseSynthesizer`](ResponseSynthesizer.md)

#### Defined in

[packages/core/src/QueryEngine.ts:84](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/QueryEngine.ts#L84)

## Methods

### query

▸ **query**(`query`): `Promise`<[`Response`](Response.md)\>

Query the query engine and get a response.

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `query` | `string` |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[BaseQueryEngine](../interfaces/BaseQueryEngine.md).[query](../interfaces/BaseQueryEngine.md#query)

#### Defined in

[packages/core/src/QueryEngine.ts:130](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/QueryEngine.ts#L130)

---

### querySubQ

▸ `Private` **querySubQ**(`subQ`, `parentEvent?`): `Promise`<`null` \| [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>\>

#### Parameters

| Name           | Type                                          |
| :------------- | :-------------------------------------------- |
| `subQ`         | [`SubQuestion`](../interfaces/SubQuestion.md) |
| `parentEvent?` | [`Event`](../interfaces/Event.md)             |

#### Returns

`Promise`<`null` \| [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>\>

#### Defined in

[packages/core/src/QueryEngine.ts:158](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/QueryEngine.ts#L158)

---

### fromDefaults

▸ `Static` **fromDefaults**(`init`): [`SubQuestionQueryEngine`](SubQuestionQueryEngine.md)

#### Parameters

| Name                        | Type                                                              |
| :-------------------------- | :---------------------------------------------------------------- |
| `init`                      | `Object`                                                          |
| `init.queryEngineTools`     | [`QueryEngineTool`](../interfaces/QueryEngineTool.md)[]           |
| `init.questionGen?`         | [`BaseQuestionGenerator`](../interfaces/BaseQuestionGenerator.md) |
| `init.responseSynthesizer?` | [`ResponseSynthesizer`](ResponseSynthesizer.md)                   |
| `init.serviceContext?`      | [`ServiceContext`](../interfaces/ServiceContext.md)               |

#### Returns

[`SubQuestionQueryEngine`](SubQuestionQueryEngine.md)

#### Defined in

[packages/core/src/QueryEngine.ts:106](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/QueryEngine.ts#L106)
