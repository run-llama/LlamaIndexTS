---
id: "ClipEmbedding"
title: "Class: ClipEmbedding"
sidebar_label: "ClipEmbedding"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`MultiModalEmbedding`](MultiModalEmbedding.md)

  ↳ **`ClipEmbedding`**

## Constructors

### constructor

• **new ClipEmbedding**()

#### Inherited from

[MultiModalEmbedding](MultiModalEmbedding.md).[constructor](MultiModalEmbedding.md#constructor)

## Properties

### modelType

• **modelType**: [`ClipEmbeddingModelType`](../enums/ClipEmbeddingModelType.md) = `ClipEmbeddingModelType.XENOVA_CLIP_VIT_BASE_PATCH16`

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L11)

---

### processor

• `Private` **processor**: `any`

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:15](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L15)

---

### textModel

• `Private` **textModel**: `any`

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L17)

---

### tokenizer

• `Private` **tokenizer**: `any`

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L14)

---

### visionModel

• `Private` **visionModel**: `any`

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L16)

## Methods

### getImageEmbedding

▸ **getImageEmbedding**(`image`): `Promise`<`number`[]\>

#### Parameters

| Name    | Type                         |
| :------ | :--------------------------- |
| `image` | [`ImageType`](../#imagetype) |

#### Returns

`Promise`<`number`[]\>

#### Overrides

[MultiModalEmbedding](MultiModalEmbedding.md).[getImageEmbedding](MultiModalEmbedding.md#getimageembedding)

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L61)

---

### getImageEmbeddings

▸ **getImageEmbeddings**(`images`): `Promise`<`number`[][]\>

#### Parameters

| Name     | Type                           |
| :------- | :----------------------------- |
| `images` | [`ImageType`](../#imagetype)[] |

#### Returns

`Promise`<`number`[][]\>

#### Inherited from

[MultiModalEmbedding](MultiModalEmbedding.md).[getImageEmbeddings](MultiModalEmbedding.md#getimageembeddings)

#### Defined in

[packages/core/src/embeddings/MultiModalEmbedding.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/MultiModalEmbedding.ts#L11)

---

### getProcessor

▸ **getProcessor**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L27)

---

### getQueryEmbedding

▸ **getQueryEmbedding**(`query`): `Promise`<`number`[]\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `query` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Overrides

[MultiModalEmbedding](MultiModalEmbedding.md).[getQueryEmbedding](MultiModalEmbedding.md#getqueryembedding)

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L76)

---

### getTextEmbedding

▸ **getTextEmbedding**(`text`): `Promise`<`number`[]\>

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `text` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Overrides

[MultiModalEmbedding](MultiModalEmbedding.md).[getTextEmbedding](MultiModalEmbedding.md#gettextembedding)

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L68)

---

### getTextModel

▸ **getTextModel**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L48)

---

### getTokenizer

▸ **getTokenizer**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L19)

---

### getVisionModel

▸ **getVisionModel**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[packages/core/src/embeddings/ClipEmbedding.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/ClipEmbedding.ts#L35)

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

[MultiModalEmbedding](MultiModalEmbedding.md).[similarity](MultiModalEmbedding.md#similarity)

#### Defined in

[packages/core/src/embeddings/types.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/embeddings/types.ts#L14)
