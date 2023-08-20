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

[Embedding.ts:236](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L236)

## Properties

### additionalSessionOptions

• `Optional` **additionalSessionOptions**: `Omit`<`Partial`<`ClientOptions`\>, ``"apiKey"`` \| ``"timeout"`` \| ``"maxRetries"``\>

#### Defined in

[Embedding.ts:229](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L229)

___

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[Embedding.ts:226](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L226)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[Embedding.ts:227](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L227)

___

### model

• **model**: `TEXT_EMBED_ADA_002`

#### Defined in

[Embedding.ts:223](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L223)

___

### session

• **session**: `OpenAISession`

#### Defined in

[Embedding.ts:234](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L234)

___

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[Embedding.ts:228](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L228)

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

[Embedding.ts:282](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L282)

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

[Embedding.ts:298](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L298)

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

[Embedding.ts:294](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L294)

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

[Embedding.ts:206](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L206)
