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

| Name              | Type                                                |
| :---------------- | :-------------------------------------------------- |
| `serviceContext`  | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `textQATemplate?` | (`__namedParameters`: `Object`) => `string`         |
| `refineTemplate?` | (`__namedParameters`: `Object`) => `string`         |

#### Inherited from

[Refine](Refine.md).[constructor](Refine.md#constructor)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:82](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L82)

## Properties

### refineTemplate

• **refineTemplate**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Inherited from

[Refine](Refine.md).[refineTemplate](Refine.md#refinetemplate)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:80](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L80)

---

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[Refine](Refine.md).[serviceContext](Refine.md#servicecontext)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:78](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L78)

---

### textQATemplate

• **textQATemplate**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Inherited from

[Refine](Refine.md).[textQATemplate](Refine.md#textqatemplate)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:79](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L79)

## Methods

### getResponse

▸ **getResponse**(`query`, `textChunks`, `parentEvent?`, `prevResponse?`): `Promise`<`string`\>

#### Parameters

| Name            | Type                              |
| :-------------- | :-------------------------------- |
| `query`         | `string`                          |
| `textChunks`    | `string`[]                        |
| `parentEvent?`  | [`Event`](../interfaces/Event.md) |
| `prevResponse?` | `string`                          |

#### Returns

`Promise`<`string`\>

#### Overrides

[Refine](Refine.md).[getResponse](Refine.md#getresponse)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:185](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L185)
