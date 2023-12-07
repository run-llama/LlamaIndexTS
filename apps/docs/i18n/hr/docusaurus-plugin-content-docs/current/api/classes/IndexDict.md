---
id: "IndexDict"
title: "Class: IndexDict"
sidebar_label: "IndexDict"
sidebar_position: 0
custom_edit_url: null
---

The underlying structure of each index.

## Hierarchy

- [`IndexStruct`](IndexStruct.md)

  ↳ **`IndexDict`**

## Constructors

### constructor

• **new IndexDict**(`indexId?`, `summary?`)

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

### nodesDict

• **nodesDict**: `Record`<`string`, [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\> = `{}`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L46)

---

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L17)

---

### type

• **type**: [`IndexStructType`](../enums/IndexStructType.md) = `IndexStructType.SIMPLE_DICT`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:47](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L47)

## Methods

### addNode

▸ **addNode**(`node`, `textId?`): `void`

#### Parameters

| Name      | Type                                                   |
| :-------- | :----------------------------------------------------- |
| `node`    | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\> |
| `textId?` | `string`                                               |

#### Returns

`void`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L56)

---

### delete

▸ **delete**(`nodeId`): `void`

#### Parameters

| Name     | Type     |
| :------- | :------- |
| `nodeId` | `string` |

#### Returns

`void`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L69)

---

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Overrides

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L49)

---

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Overrides

[IndexStruct](IndexStruct.md).[toJson](IndexStruct.md#tojson)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L61)
