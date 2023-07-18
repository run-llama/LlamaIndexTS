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

[QueryEngine.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/QueryEngine.ts#L56)

## Properties

### metadatas

• **metadatas**: [`ToolMetadata`](../interfaces/ToolMetadata.md)[]

#### Defined in

[QueryEngine.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/QueryEngine.ts#L54)

___

### queryEngines

• **queryEngines**: `Record`<`string`, [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)\>

#### Defined in

[QueryEngine.ts:53](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/QueryEngine.ts#L53)

___

### questionGen

• **questionGen**: [`BaseQuestionGenerator`](../interfaces/BaseQuestionGenerator.md)

#### Defined in

[QueryEngine.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/QueryEngine.ts#L52)

___

### responseSynthesizer

• **responseSynthesizer**: [`ResponseSynthesizer`](ResponseSynthesizer.md)

#### Defined in

[QueryEngine.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/QueryEngine.ts#L51)

## Methods

### aquery

▸ **aquery**(`query`): `Promise`<[`Response`](Response.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[BaseQueryEngine](../interfaces/BaseQueryEngine.md).[aquery](../interfaces/BaseQueryEngine.md#aquery)

#### Defined in

[QueryEngine.ts:97](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/QueryEngine.ts#L97)

___

### aquerySubQ

▸ `Private` **aquerySubQ**(`subQ`, `parentEvent?`): `Promise`<``null`` \| [`NodeWithScore`](../interfaces/NodeWithScore.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `subQ` | [`SubQuestion`](../interfaces/SubQuestion.md) |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<``null`` \| [`NodeWithScore`](../interfaces/NodeWithScore.md)\>

#### Defined in

[QueryEngine.ts:128](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/QueryEngine.ts#L128)

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

[QueryEngine.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/QueryEngine.ts#L73)
