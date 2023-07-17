---
id: "ListIndexLLMRetriever"
title: "Class: ListIndexLLMRetriever"
sidebar_label: "ListIndexLLMRetriever"
sidebar_position: 0
custom_edit_url: null
---

LLM retriever for ListIndex.

## Implements

- [`BaseRetriever`](../interfaces/BaseRetriever.md)

## Constructors

### constructor

• **new ListIndexLLMRetriever**(`index`, `choiceSelectPrompt?`, `choiceBatchSize?`, `formatNodeBatchFn?`, `parseChoiceSelectAnswerFn?`, `serviceContext?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `index` | [`ListIndex`](ListIndex.md) | `undefined` |
| `choiceSelectPrompt?` | [`SimplePrompt`](../modules.md#simpleprompt) | `undefined` |
| `choiceBatchSize` | `number` | `10` |
| `formatNodeBatchFn?` | `NodeFormatterFunction` | `undefined` |
| `parseChoiceSelectAnswerFn?` | `ChoiceSelectParserFunction` | `undefined` |
| `serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) | `undefined` |

#### Defined in

[index/list/ListIndexRetriever.ts:67](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L67)

## Properties

### choiceBatchSize

• **choiceBatchSize**: `number`

#### Defined in

[index/list/ListIndexRetriever.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L62)

___

### choiceSelectPrompt

• **choiceSelectPrompt**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[index/list/ListIndexRetriever.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L61)

___

### formatNodeBatchFn

• **formatNodeBatchFn**: `NodeFormatterFunction`

#### Defined in

[index/list/ListIndexRetriever.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L63)

___

### index

• **index**: [`ListIndex`](ListIndex.md)

#### Defined in

[index/list/ListIndexRetriever.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L60)

___

### parseChoiceSelectAnswerFn

• **parseChoiceSelectAnswerFn**: `ChoiceSelectParserFunction`

#### Defined in

[index/list/ListIndexRetriever.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L64)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[index/list/ListIndexRetriever.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L65)

## Methods

### aretrieve

▸ **aretrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[aretrieve](../interfaces/BaseRetriever.md#aretrieve)

#### Defined in

[index/list/ListIndexRetriever.ts:84](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L84)

___

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[index/list/ListIndexRetriever.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndexRetriever.ts#L134)
