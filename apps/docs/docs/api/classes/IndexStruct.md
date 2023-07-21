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

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/indices/BaseIndex.ts#L17)

## Properties

### indexId

• **indexId**: `string`

#### Defined in

[indices/BaseIndex.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/indices/BaseIndex.ts#L14)

___

### summary

• `Optional` **summary**: `string`

#### Defined in

[indices/BaseIndex.ts:15](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/indices/BaseIndex.ts#L15)

## Methods

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Defined in

[indices/BaseIndex.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/indices/BaseIndex.ts#L22)
