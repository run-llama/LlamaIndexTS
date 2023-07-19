---
id: "BaseReader"
title: "Interface: BaseReader"
sidebar_label: "BaseReader"
sidebar_position: 0
custom_edit_url: null
---

A reader takes imports data into Document objects.

## Implemented by

- [`TextFileReader`](../classes/TextFileReader.md)

## Methods

### loadData

▸ **loadData**(`...args`): `Promise`<[`Document`](../classes/Document.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`Promise`<[`Document`](../classes/Document.md)[]\>

#### Defined in

[readers/base.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/d73ac8e/packages/core/src/readers/base.ts#L7)
