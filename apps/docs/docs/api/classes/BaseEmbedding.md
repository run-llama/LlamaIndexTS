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

### aGetQueryEmbedding

▸ `Abstract` **aGetQueryEmbedding**(`query`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[Embedding.ts:186](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L186)

___

### aGetTextEmbedding

▸ `Abstract` **aGetTextEmbedding**(`text`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[Embedding.ts:185](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L185)

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

[Embedding.ts:177](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L177)
