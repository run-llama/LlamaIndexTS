---
id: "KeywordTable"
title: "Class: KeywordTable"
sidebar_label: "KeywordTable"
sidebar_position: 0
custom_edit_url: null
---

The underlying structure of each index.

## Hierarchy

- [`IndexStruct`](IndexStruct.md)

  ↳ **`KeywordTable`**

## Constructors

### constructor

• **new KeywordTable**(`indexId?`, `summary?`)

#### Parameters

| Name      | Type        | Default value |
| :-------- | :---------- | :------------ |
| `indexId` | `string`    | `undefined`   |
| `summary` | `undefined` | `undefined`   |

#### Inherited from

[IndexStruct](IndexStruct.md).[constructor](IndexStruct.md#constructor)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L19)

## Properties

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L16)

---

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L17)

---

### table

• **table**: `Map`<`string`, `Set`<`string`\>\>

#### Defined in

[packages/core/src/indices/BaseIndex.ts:112](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L112)

---

### type

• **type**: [`IndexStructType`](../enums/IndexStructType.md) = `IndexStructType.KEYWORD_TABLE`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:113](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L113)

## Methods

### addNode

▸ **addNode**(`keywords`, `nodeId`): `void`

#### Parameters

| Name       | Type       |
| :--------- | :--------- |
| `keywords` | `string`[] |
| `nodeId`   | `string`   |

#### Returns

`void`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:114](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L114)

---

### deleteNode

▸ **deleteNode**(`keywords`, `nodeId`): `void`

#### Parameters

| Name       | Type       |
| :--------- | :--------- |
| `keywords` | `string`[] |
| `nodeId`   | `string`   |

#### Returns

`void`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:123](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L123)

---

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Inherited from

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L31)

---

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Overrides

[IndexStruct](IndexStruct.md).[toJson](IndexStruct.md#tojson)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:131](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L131)
