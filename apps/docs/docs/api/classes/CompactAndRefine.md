---
id: "CompactAndRefine"
title: "Class: CompactAndRefine"
sidebar_label: "CompactAndRefine"
sidebar_position: 0
custom_edit_url: null
---

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

[ResponseSynthesizer.ts:51](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L51)

## Properties

### refineTemplate

• **refineTemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Inherited from

[Refine](Refine.md).[refineTemplate](Refine.md#refinetemplate)

#### Defined in

[ResponseSynthesizer.ts:49](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L49)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[Refine](Refine.md).[serviceContext](Refine.md#servicecontext)

#### Defined in

[ResponseSynthesizer.ts:47](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L47)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Inherited from

[Refine](Refine.md).[textQATemplate](Refine.md#textqatemplate)

#### Defined in

[ResponseSynthesizer.ts:48](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L48)

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

[ResponseSynthesizer.ts:133](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L133)
