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

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`OpenAIEmbedding`](OpenAIEmbedding.md)\> & { `azure?`: `AzureOpenAIConfig`  } |

#### Overrides

[BaseEmbedding](BaseEmbedding.md).[constructor](BaseEmbedding.md#constructor)

#### Defined in

[Embedding.ts:229](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L229)

## Properties

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[Embedding.ts:224](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L224)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[Embedding.ts:225](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L225)

___

### model

• **model**: `TEXT_EMBED_ADA_002`

#### Defined in

[Embedding.ts:221](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L221)

___

### session

• **session**: `OpenAISession`

#### Defined in

[Embedding.ts:227](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L227)

___

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[Embedding.ts:226](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L226)

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

[Embedding.ts:272](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L272)

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

[Embedding.ts:288](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L288)

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

[Embedding.ts:284](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L284)

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

[Embedding.ts:204](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L204)
