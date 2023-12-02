---
id: "ContextGenerator"
title: "Interface: ContextGenerator"
sidebar_label: "ContextGenerator"
sidebar_position: 0
custom_edit_url: null
---

## Implemented by

- [`DefaultContextGenerator`](../classes/DefaultContextGenerator.md)

## Methods

### generate

▸ **generate**(`message`, `parentEvent?`): `Promise`<[`Context`](Context.md)\>

#### Parameters

| Name           | Type                |
| :------------- | :------------------ |
| `message`      | `string`            |
| `parentEvent?` | [`Event`](Event.md) |

#### Returns

`Promise`<[`Context`](Context.md)\>

#### Defined in

[packages/core/src/ChatEngine.ts:180](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L180)
