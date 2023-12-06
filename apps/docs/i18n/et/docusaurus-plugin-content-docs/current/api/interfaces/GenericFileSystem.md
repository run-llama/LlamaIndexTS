---
id: "GenericFileSystem"
title: "Interface: GenericFileSystem"
sidebar_label: "GenericFileSystem"
sidebar_position: 0
custom_edit_url: null
---

A filesystem interface that is meant to be compatible with
the 'fs' module from Node.js.
Allows for the use of similar inteface implementation on
browsers.

## Implemented by

- [`InMemoryFileSystem`](../classes/InMemoryFileSystem.md)

## Methods

### access

▸ **access**(`path`): `Promise`<`void`\>

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `path` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/FileSystem.ts:12](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/FileSystem.ts#L12)

---

### mkdir

▸ **mkdir**(`path`, `options?`): `Promise`<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `path`     | `string` |
| `options?` | `any`    |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/FileSystem.ts:13](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/FileSystem.ts#L13)

---

### readFile

▸ **readFile**(`path`, `options?`): `Promise`<`string`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `path`     | `string` |
| `options?` | `any`    |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/core/src/storage/FileSystem.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/FileSystem.ts#L11)

---

### writeFile

▸ **writeFile**(`path`, `content`, `options?`): `Promise`<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `path`     | `string` |
| `content`  | `string` |
| `options?` | `any`    |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/FileSystem.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/FileSystem.ts#L10)
