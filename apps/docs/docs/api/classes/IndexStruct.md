---
id: "IndexStruct"
title: "Class: IndexStruct"
sidebar_label: "IndexStruct"
sidebar_position: 0
custom_edit_url: null
---

The underlying structure of each index.

## Hierarchy

- **`IndexStruct`**

  ↳ [`IndexDict`](IndexDict.md)

  ↳ [`IndexList`](IndexList.md)

## Constructors

### constructor

• **new IndexStruct**(`indexId?`, `summary?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `indexId` | `string` | `undefined` |
| `summary` | `undefined` | `undefined` |

#### Defined in

[indices/BaseIndex.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/ea5038e/packages/core/src/indices/BaseIndex.ts#L20)

## Properties

### indexId

• **indexId**: `string`

#### Defined in

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/ea5038e/packages/core/src/indices/BaseIndex.ts#L17)

___

### summary

• `Optional` **summary**: `string`

#### Defined in

[indices/BaseIndex.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/ea5038e/packages/core/src/indices/BaseIndex.ts#L18)

## Methods

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Defined in

[indices/BaseIndex.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/ea5038e/packages/core/src/indices/BaseIndex.ts#L32)

___

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Defined in

[indices/BaseIndex.ts:25](https://github.com/run-llama/LlamaIndexTS/blob/ea5038e/packages/core/src/indices/BaseIndex.ts#L25)
