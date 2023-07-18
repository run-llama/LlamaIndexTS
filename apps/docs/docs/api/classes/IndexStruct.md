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

[BaseIndex.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L21)

## Properties

### indexId

• **indexId**: `string`

#### Defined in

[BaseIndex.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L18)

___

### summary

• `Optional` **summary**: `string`

#### Defined in

[BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L19)

## Methods

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Defined in

[BaseIndex.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L26)
