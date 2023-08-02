---
id: "BaseEmbedding"
title: "Class: BaseEmbedding"
sidebar_label: "BaseEmbedding"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- **`BaseEmbedding`**

  ↳ [`OpenAIEmbedding`](OpenAIEmbedding.md)

## Constructors

### constructor

• **new BaseEmbedding**()

## Methods

### getQueryEmbedding

▸ `Abstract` **getQueryEmbedding**(`query`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[Embedding.ts:213](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L213)

___

### getTextEmbedding

▸ `Abstract` **getTextEmbedding**(`text`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[Embedding.ts:212](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L212)

___

### similarity

▸ **similarity**(`embedding1`, `embedding2`, `mode?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `embedding1` | `number`[] | `undefined` |
| `embedding2` | `number`[] | `undefined` |
| `mode` | [`SimilarityType`](../enums/SimilarityType.md) | `SimilarityType.DEFAULT` |

#### Returns

`number`

#### Defined in

[Embedding.ts:204](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L204)
