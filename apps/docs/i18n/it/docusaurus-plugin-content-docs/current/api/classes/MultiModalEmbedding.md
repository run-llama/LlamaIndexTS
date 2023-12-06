---
id: "MultiModalEmbedding"
title: "Class: MultiModalEmbedding"
sidebar_label: "MultiModalEmbedding"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`BaseEmbedding`](BaseEmbedding.md)

  ↳ **`MultiModalEmbedding`**

  ↳↳ [`ClipEmbedding`](ClipEmbedding.md)

## Constructors

### constructor

• **new MultiModalEmbedding**()

#### Inherited from

[BaseEmbedding](BaseEmbedding.md).[constructor](BaseEmbedding.md#constructor)

## Methods

### getImageEmbedding

▸ `Abstract` **getImageEmbedding**(`images`): `Promise`<`number`[]\>

#### Parameters

| Name     | Type                         |
| :------- | :--------------------------- |
| `images` | [`ImageType`](../#imagetype) |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[packages/core/src/embeddings/MultiModalEmbedding.ts:9](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/embeddings/MultiModalEmbedding.ts#L9)

---

### getImageEmbeddings

▸ **getImageEmbeddings**(`images`): `Promise`<`number`[][]\>

#### Parameters

| Name     | Type                           |
| :------- | :----------------------------- |
| `images` | [`ImageType`](../#imagetype)[] |

#### Returns

`Promise`<`number`[][]\>

#### Defined in

[packages/core/src/embeddings/MultiModalEmbedding.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/embeddings/MultiModalEmbedding.ts#L11)

---

### getQueryEmbedding

▸ `Abstract` **getQueryEmbedding**(`query`): `Promise`<`number`[]\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `query` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Inherited from

[BaseEmbedding](BaseEmbedding.md).[getQueryEmbedding](BaseEmbedding.md#getqueryembedding)

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

#### Inherited from

[BaseEmbedding](BaseEmbedding.md).[getTextEmbedding](BaseEmbedding.md#gettextembedding)

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

#### Inherited from

[BaseEmbedding](BaseEmbedding.md).[similarity](BaseEmbedding.md#similarity)

#### Defined in

[packages/core/src/embeddings/types.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/embeddings/types.ts#L14)
