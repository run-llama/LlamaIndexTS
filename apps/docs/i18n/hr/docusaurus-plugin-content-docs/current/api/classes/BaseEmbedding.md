---
id: "BaseEmbedding"
title: "Class: BaseEmbedding"
sidebar_label: "BaseEmbedding"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- **`BaseEmbedding`**

  ↳ [`MultiModalEmbedding`](MultiModalEmbedding.md)

  ↳ [`OpenAIEmbedding`](OpenAIEmbedding.md)

## Constructors

### constructor

• **new BaseEmbedding**()

## Methods

### getQueryEmbedding

▸ `Abstract` **getQueryEmbedding**(`query`): `Promise`<`number`[]\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `query` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[packages/core/src/embeddings/types.ts:23](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/embeddings/types.ts#L23)

---

### getTextEmbedding

▸ `Abstract` **getTextEmbedding**(`text`): `Promise`<`number`[]\>

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `text` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[packages/core/src/embeddings/types.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/embeddings/types.ts#L22)

---

### similarity

▸ **similarity**(`embedding1`, `embedding2`, `mode?`): `number`

#### Parameters

| Name         | Type                                           | Default value            |
| :----------- | :--------------------------------------------- | :----------------------- |
| `embedding1` | `number`[]                                     | `undefined`              |
| `embedding2` | `number`[]                                     | `undefined`              |
| `mode`       | [`SimilarityType`](../enums/SimilarityType.md) | `SimilarityType.DEFAULT` |

#### Returns

`number`

#### Defined in

[packages/core/src/embeddings/types.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/embeddings/types.ts#L14)
