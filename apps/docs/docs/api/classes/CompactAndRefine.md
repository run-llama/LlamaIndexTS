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

[ResponseSynthesizer.ts:78](https://github.com/run-llama/LlamaIndexTS/blob/3e85a90/packages/core/src/ResponseSynthesizer.ts#L78)

## Properties

### refineTemplate

• **refineTemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Inherited from

[Refine](Refine.md).[refineTemplate](Refine.md#refinetemplate)

#### Defined in

[ResponseSynthesizer.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/3e85a90/packages/core/src/ResponseSynthesizer.ts#L76)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[Refine](Refine.md).[serviceContext](Refine.md#servicecontext)

#### Defined in

[ResponseSynthesizer.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/3e85a90/packages/core/src/ResponseSynthesizer.ts#L74)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Inherited from

[Refine](Refine.md).[textQATemplate](Refine.md#textqatemplate)

#### Defined in

[ResponseSynthesizer.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/3e85a90/packages/core/src/ResponseSynthesizer.ts#L75)

## Methods

### getResponse

▸ **getResponse**(`query`, `textChunks`, `parentEvent?`, `prevResponse?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `textChunks` | `string`[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |
| `prevResponse?` | `string` |

#### Returns

`Promise`<`string`\>

#### Overrides

[Refine](Refine.md).[getResponse](Refine.md#getresponse)

#### Defined in

[ResponseSynthesizer.ts:181](https://github.com/run-llama/LlamaIndexTS/blob/3e85a90/packages/core/src/ResponseSynthesizer.ts#L181)
