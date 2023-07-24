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

• **new OpenAIEmbedding**()

#### Overrides

[BaseEmbedding](BaseEmbedding.md).[constructor](BaseEmbedding.md#constructor)

#### Defined in

[Embedding.ts:217](https://github.com/run-llama/LlamaIndexTS/blob/6f2cb31/packages/core/src/Embedding.ts#L217)

## Properties

### model

• **model**: `TEXT_EMBED_ADA_002`

#### Defined in

[Embedding.ts:215](https://github.com/run-llama/LlamaIndexTS/blob/6f2cb31/packages/core/src/Embedding.ts#L215)

___

### session

• **session**: `OpenAISession`

#### Defined in

[Embedding.ts:214](https://github.com/run-llama/LlamaIndexTS/blob/6f2cb31/packages/core/src/Embedding.ts#L214)

## Methods

### getOpenAIEmbedding

▸ `Private` **getOpenAIEmbedding**(`input`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[Embedding.ts:224](https://github.com/run-llama/LlamaIndexTS/blob/6f2cb31/packages/core/src/Embedding.ts#L224)

___

### getQueryEmbedding

▸ **getQueryEmbedding**(`query`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Overrides

[BaseEmbedding](BaseEmbedding.md).[getQueryEmbedding](BaseEmbedding.md#getqueryembedding)

#### Defined in

[Embedding.ts:240](https://github.com/run-llama/LlamaIndexTS/blob/6f2cb31/packages/core/src/Embedding.ts#L240)

___

### getTextEmbedding

▸ **getTextEmbedding**(`text`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Overrides

[BaseEmbedding](BaseEmbedding.md).[getTextEmbedding](BaseEmbedding.md#gettextembedding)

#### Defined in

[Embedding.ts:236](https://github.com/run-llama/LlamaIndexTS/blob/6f2cb31/packages/core/src/Embedding.ts#L236)

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

#### Inherited from

[BaseEmbedding](BaseEmbedding.md).[similarity](BaseEmbedding.md#similarity)

#### Defined in

[Embedding.ts:197](https://github.com/run-llama/LlamaIndexTS/blob/6f2cb31/packages/core/src/Embedding.ts#L197)
