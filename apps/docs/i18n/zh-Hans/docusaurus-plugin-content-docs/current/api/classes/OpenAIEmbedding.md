---
id: "OpenAIEmbedding"
title: "Class: OpenAIEmbedding"
sidebar_label: "OpenAIEmbedding"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`BaseEmbedding`](BaseEmbedding.md)

  ↳ **`OpenAIEmbedding`**

## Constructors

### constructor

• **new OpenAIEmbedding**(`init?`)

#### Parameters

| Name    | Type                                                                                    |
| :------ | :-------------------------------------------------------------------------------------- |
| `init?` | `Partial`<[`OpenAIEmbedding`](OpenAIEmbedding.md)\> & { `azure?`: `AzureOpenAIConfig` } |

#### Overrides

[BaseEmbedding](BaseEmbedding.md).[constructor](BaseEmbedding.md#constructor)

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:30](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L30)

## Properties

### additionalSessionOptions

• `Optional` **additionalSessionOptions**: `Omit`<`Partial`<`ClientOptions`\>, `"apiKey"` \| `"timeout"` \| `"maxRetries"`\>

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:23](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L23)

---

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L20)

---

### maxRetries

• **maxRetries**: `number`

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L21)

---

### model

• **model**: [`TEXT_EMBED_ADA_002`](../enums/OpenAIEmbeddingModelType.md#text_embed_ada_002)

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L17)

---

### session

• **session**: `OpenAISession`

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:28](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L28)

---

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L22)

## Methods

### getOpenAIEmbedding

▸ `Private` **getOpenAIEmbedding**(`input`): `Promise`<`number`[]\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `input` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L76)

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

[BaseEmbedding](BaseEmbedding.md).[getQueryEmbedding](BaseEmbedding.md#getqueryembedding)

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:89](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L89)

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

[BaseEmbedding](BaseEmbedding.md).[getTextEmbedding](BaseEmbedding.md#gettextembedding)

#### Defined in

[packages/core/src/embeddings/OpenAIEmbedding.ts:85](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/OpenAIEmbedding.ts#L85)

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

[packages/core/src/embeddings/types.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/types.ts#L14)
