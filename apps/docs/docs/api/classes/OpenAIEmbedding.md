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

[Embedding.ts:197](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L197)

## Properties

### model

• **model**: `TEXT_EMBED_ADA_002`

#### Defined in

[Embedding.ts:195](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L195)

___

### session

• **session**: `OpenAISession`

#### Defined in

[Embedding.ts:194](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L194)

## Methods

### \_aGetOpenAIEmbedding

▸ `Private` **_aGetOpenAIEmbedding**(`input`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[Embedding.ts:204](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L204)

___

### aGetQueryEmbedding

▸ **aGetQueryEmbedding**(`query`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Overrides

[BaseEmbedding](BaseEmbedding.md).[aGetQueryEmbedding](BaseEmbedding.md#agetqueryembedding)

#### Defined in

[Embedding.ts:220](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L220)

___

### aGetTextEmbedding

▸ **aGetTextEmbedding**(`text`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Overrides

[BaseEmbedding](BaseEmbedding.md).[aGetTextEmbedding](BaseEmbedding.md#agettextembedding)

#### Defined in

[Embedding.ts:216](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L216)

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

[Embedding.ts:177](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L177)
