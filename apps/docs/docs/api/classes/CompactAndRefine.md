---
id: "CompactAndRefine"
title: "Class: CompactAndRefine"
sidebar_label: "CompactAndRefine"
sidebar_position: 0
custom_edit_url: null
---

CompactAndRefine is a slight variation of Refine that first compacts the text chunks into the smallest possible number of chunks.

## Hierarchy

- [`Refine`](Refine.md)

  ↳ **`CompactAndRefine`**

## Constructors

### constructor

• **new CompactAndRefine**(`serviceContext`, `textQATemplate?`, `refineTemplate?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `textQATemplate?` | [`SimplePrompt`](../modules.md#simpleprompt) |
| `refineTemplate?` | [`SimplePrompt`](../modules.md#simpleprompt) |

#### Inherited from

[Refine](Refine.md).[constructor](Refine.md#constructor)

#### Defined in

[ResponseSynthesizer.ts:66](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/ResponseSynthesizer.ts#L66)

## Properties

### refineTemplate

• **refineTemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Inherited from

[Refine](Refine.md).[refineTemplate](Refine.md#refinetemplate)

#### Defined in

[ResponseSynthesizer.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/ResponseSynthesizer.ts#L64)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[Refine](Refine.md).[serviceContext](Refine.md#servicecontext)

#### Defined in

[ResponseSynthesizer.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/ResponseSynthesizer.ts#L62)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Inherited from

[Refine](Refine.md).[textQATemplate](Refine.md#textqatemplate)

#### Defined in

[ResponseSynthesizer.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/ResponseSynthesizer.ts#L63)

## Methods

### agetResponse

▸ **agetResponse**(`query`, `textChunks`, `prevResponse?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `textChunks` | `string`[] |
| `prevResponse?` | `any` |

#### Returns

`Promise`<`string`\>

#### Overrides

[Refine](Refine.md).[agetResponse](Refine.md#agetresponse)

#### Defined in

[ResponseSynthesizer.ts:152](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/ResponseSynthesizer.ts#L152)
