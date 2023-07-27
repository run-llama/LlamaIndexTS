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
| `init?` | `Partial`<[`OpenAIEmbedding`](OpenAIEmbedding.md)\> |

#### Overrides

[BaseEmbedding](BaseEmbedding.md).[constructor](BaseEmbedding.md#constructor)

#### Defined in

[Embedding.ts:222](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L222)

## Properties

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[Embedding.ts:217](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L217)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[Embedding.ts:218](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L218)

___

### model

• **model**: `TEXT_EMBED_ADA_002`

#### Defined in

[Embedding.ts:214](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L214)

___

### session

• **session**: `OpenAISession`

#### Defined in

[Embedding.ts:220](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L220)

___

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[Embedding.ts:219](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L219)

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

[Embedding.ts:237](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L237)

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

[Embedding.ts:253](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L253)

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

[Embedding.ts:249](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L249)

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

[Embedding.ts:197](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L197)
