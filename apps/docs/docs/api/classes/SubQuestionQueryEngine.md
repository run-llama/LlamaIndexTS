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

| Name | Type |
| :------ | :------ |
| `init` | `Object` |
| `init.queryEngineTools` | [`QueryEngineTool`](../interfaces/QueryEngineTool.md)[] |
| `init.questionGen` | [`BaseQuestionGenerator`](../interfaces/BaseQuestionGenerator.md) |
| `init.responseSynthesizer` | [`ResponseSynthesizer`](ResponseSynthesizer.md) |

#### Defined in

[QueryEngine.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/QueryEngine.ts#L65)

## Properties

### metadatas

• **metadatas**: [`ToolMetadata`](../interfaces/ToolMetadata.md)[]

#### Defined in

[QueryEngine.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/QueryEngine.ts#L63)

___

### queryEngines

• **queryEngines**: `Record`<`string`, [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)\>

#### Defined in

[QueryEngine.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/QueryEngine.ts#L62)

___

### questionGen

• **questionGen**: [`BaseQuestionGenerator`](../interfaces/BaseQuestionGenerator.md)

#### Defined in

[QueryEngine.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/QueryEngine.ts#L61)

___

### responseSynthesizer

• **responseSynthesizer**: [`ResponseSynthesizer`](ResponseSynthesizer.md)

#### Defined in

[QueryEngine.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/QueryEngine.ts#L60)

## Methods

### query

▸ **query**(`query`): `Promise`<[`Response`](Response.md)\>

Query the query engine and get a response.

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[BaseQueryEngine](../interfaces/BaseQueryEngine.md).[query](../interfaces/BaseQueryEngine.md#query)

#### Defined in

[QueryEngine.ts:106](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/QueryEngine.ts#L106)

___

### querySubQ

▸ `Private` **querySubQ**(`subQ`, `parentEvent?`): `Promise`<``null`` \| [`NodeWithScore`](../interfaces/NodeWithScore.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `subQ` | [`SubQuestion`](../interfaces/SubQuestion.md) |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<``null`` \| [`NodeWithScore`](../interfaces/NodeWithScore.md)\>

#### Defined in

[QueryEngine.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/QueryEngine.ts#L134)

___

### fromDefaults

▸ `Static` **fromDefaults**(`init`): [`SubQuestionQueryEngine`](SubQuestionQueryEngine.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | `Object` |
| `init.queryEngineTools` | [`QueryEngineTool`](../interfaces/QueryEngineTool.md)[] |
| `init.questionGen?` | [`BaseQuestionGenerator`](../interfaces/BaseQuestionGenerator.md) |
| `init.responseSynthesizer?` | [`ResponseSynthesizer`](ResponseSynthesizer.md) |
| `init.serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Returns

[`SubQuestionQueryEngine`](SubQuestionQueryEngine.md)

#### Defined in

[QueryEngine.ts:82](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/QueryEngine.ts#L82)
