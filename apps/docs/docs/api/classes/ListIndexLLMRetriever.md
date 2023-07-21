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

[indices/list/ListIndexRetriever.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L64)

## Properties

### choiceBatchSize

• **choiceBatchSize**: `number`

#### Defined in

[indices/list/ListIndexRetriever.ts:59](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L59)

___

### choiceSelectPrompt

• **choiceSelectPrompt**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[indices/list/ListIndexRetriever.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L58)

___

### formatNodeBatchFn

• **formatNodeBatchFn**: `NodeFormatterFunction`

#### Defined in

[indices/list/ListIndexRetriever.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L60)

___

### index

• **index**: [`ListIndex`](ListIndex.md)

#### Defined in

[indices/list/ListIndexRetriever.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L57)

___

### parseChoiceSelectAnswerFn

• **parseChoiceSelectAnswerFn**: `ChoiceSelectParserFunction`

#### Defined in

[indices/list/ListIndexRetriever.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L61)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[indices/list/ListIndexRetriever.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L62)

## Methods

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[indices/list/ListIndexRetriever.ts:127](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L127)

___

### retrieve

▸ **retrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[retrieve](../interfaces/BaseRetriever.md#retrieve)

#### Defined in

[indices/list/ListIndexRetriever.ts:81](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/indices/list/ListIndexRetriever.ts#L81)
