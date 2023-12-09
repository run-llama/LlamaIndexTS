---
id: "TreeSummarize"
title: "Class: TreeSummarize"
sidebar_label: "TreeSummarize"
sidebar_position: 0
custom_edit_url: null
---

TreeSummarize repacks the text chunks into the smallest possible number of chunks and then summarizes them, then recursively does so until there's one chunk left.

## Implements

- `BaseResponseBuilder`

## Constructors

### constructor

• **new TreeSummarize**(`serviceContext`, `summaryTemplate?`)

#### Parameters

| Name               | Type                                                |
| :----------------- | :-------------------------------------------------- |
| `serviceContext`   | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `summaryTemplate?` | (`__namedParameters`: `Object`) => `string`         |

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:217](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L217)

## Properties

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:214](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L214)

---

### summaryTemplate

• **summaryTemplate**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:215](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L215)

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

[packages/core/src/ResponseSynthesizer.ts:225](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L225)
