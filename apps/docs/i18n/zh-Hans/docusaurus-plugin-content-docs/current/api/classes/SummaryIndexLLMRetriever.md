---
id: "SummaryIndexLLMRetriever"
title: "Class: SummaryIndexLLMRetriever"
sidebar_label: "SummaryIndexLLMRetriever"
sidebar_position: 0
custom_edit_url: null
---

LLM retriever for SummaryIndex which lets you select the most relevant chunks.

## Implements

- [`BaseRetriever`](../interfaces/BaseRetriever.md)

## Constructors

### constructor

• **new SummaryIndexLLMRetriever**(`index`, `choiceSelectPrompt?`, `choiceBatchSize?`, `formatNodeBatchFn?`, `parseChoiceSelectAnswerFn?`, `serviceContext?`)

#### Parameters

| Name                         | Type                                                | Default value |
| :--------------------------- | :-------------------------------------------------- | :------------ |
| `index`                      | [`SummaryIndex`](SummaryIndex.md)                   | `undefined`   |
| `choiceSelectPrompt?`        | (`__namedParameters`: `Object`) => `string`         | `undefined`   |
| `choiceBatchSize`            | `number`                                            | `10`          |
| `formatNodeBatchFn?`         | `NodeFormatterFunction`                             | `undefined`   |
| `parseChoiceSelectAnswerFn?` | `ChoiceSelectParserFunction`                        | `undefined`   |
| `serviceContext?`            | [`ServiceContext`](../interfaces/ServiceContext.md) | `undefined`   |

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L64)

## Properties

### choiceBatchSize

• **choiceBatchSize**: `number`

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:59](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L59)

---

### choiceSelectPrompt

• **choiceSelectPrompt**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L58)

---

### formatNodeBatchFn

• **formatNodeBatchFn**: `NodeFormatterFunction`

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L60)

---

### index

• **index**: [`SummaryIndex`](SummaryIndex.md)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L57)

---

### parseChoiceSelectAnswerFn

• **parseChoiceSelectAnswerFn**: `ChoiceSelectParserFunction`

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L61)

---

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L62)

## Methods

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:127](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L127)

---

### retrieve

▸ **retrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `query`        | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[retrieve](../interfaces/BaseRetriever.md#retrieve)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:81](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L81)
