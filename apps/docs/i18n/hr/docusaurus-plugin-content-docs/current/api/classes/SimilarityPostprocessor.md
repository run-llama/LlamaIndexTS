---
id: "SimilarityPostprocessor"
title: "Class: SimilarityPostprocessor"
sidebar_label: "SimilarityPostprocessor"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- [`BaseNodePostprocessor`](../interfaces/BaseNodePostprocessor.md)

## Constructors

### constructor

• **new SimilarityPostprocessor**(`options?`)

#### Parameters

| Name                        | Type     |
| :-------------------------- | :------- |
| `options?`                  | `Object` |
| `options.similarityCutoff?` | `number` |

#### Defined in

[packages/core/src/indices/BaseNodePostprocessor.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseNodePostprocessor.ts#L10)

## Properties

### similarityCutoff

• `Optional` **similarityCutoff**: `number`

#### Defined in

[packages/core/src/indices/BaseNodePostprocessor.ts:8](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseNodePostprocessor.ts#L8)

## Methods

### postprocessNodes

▸ **postprocessNodes**(`nodes`): [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Parameters

| Name    | Type                                                                             |
| :------ | :------------------------------------------------------------------------------- |
| `nodes` | [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Implementation of

[BaseNodePostprocessor](../interfaces/BaseNodePostprocessor.md).[postprocessNodes](../interfaces/BaseNodePostprocessor.md#postprocessnodes)

#### Defined in

[packages/core/src/indices/BaseNodePostprocessor.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseNodePostprocessor.ts#L14)
