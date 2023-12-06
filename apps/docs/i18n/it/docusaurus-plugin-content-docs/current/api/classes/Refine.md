---
id: "Refine"
title: "Class: Refine"
sidebar_label: "Refine"
sidebar_position: 0
custom_edit_url: null
---

A response builder that uses the query to ask the LLM generate a better response using multiple text chunks.

## Hierarchy

- **`Refine`**

  ↳ [`CompactAndRefine`](CompactAndRefine.md)

## Implements

- `BaseResponseBuilder`

## Constructors

### constructor

• **new Refine**(`serviceContext`, `textQATemplate?`, `refineTemplate?`)

#### Parameters

| Name              | Type                                                |
| :---------------- | :-------------------------------------------------- |
| `serviceContext`  | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `textQATemplate?` | (`__namedParameters`: `Object`) => `string`         |
| `refineTemplate?` | (`__namedParameters`: `Object`) => `string`         |

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

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:80](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L80)

---

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

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

#### Implementation of

BaseResponseBuilder.getResponse

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:92](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L92)

---

### giveResponseSingle

▸ `Private` **giveResponseSingle**(`queryStr`, `textChunk`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `queryStr`     | `string`                          |
| `textChunk`    | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:117](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L117)

---

### refineResponseSingle

▸ `Private` **refineResponseSingle**(`response`, `queryStr`, `textChunk`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `response`     | `string`                          |
| `queryStr`     | `string`                          |
| `textChunk`    | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:153](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L153)
