---
id: "BaseNodePostprocessor"
title: "Interface: BaseNodePostprocessor"
sidebar_label: "BaseNodePostprocessor"
sidebar_position: 0
custom_edit_url: null
---

## Implemented by

- [`SimilarityPostprocessor`](../classes/SimilarityPostprocessor.md)

## Properties

### postprocessNodes

• **postprocessNodes**: (`nodes`: [`NodeWithScore`](NodeWithScore.md)<[`Metadata`](../#metadata)\>[]) => [`NodeWithScore`](NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Type declaration

▸ (`nodes`): [`NodeWithScore`](NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

##### Parameters

| Name    | Type                                                               |
| :------ | :----------------------------------------------------------------- |
| `nodes` | [`NodeWithScore`](NodeWithScore.md)<[`Metadata`](../#metadata)\>[] |

##### Returns

[`NodeWithScore`](NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Defined in

[packages/core/src/indices/BaseNodePostprocessor.ts:4](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseNodePostprocessor.ts#L4)
