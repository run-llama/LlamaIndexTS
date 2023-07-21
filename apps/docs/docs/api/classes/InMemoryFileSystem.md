---
id: "InMemoryFileSystem"
title: "Class: InMemoryFileSystem"
sidebar_label: "InMemoryFileSystem"
sidebar_position: 0
custom_edit_url: null
---

A filesystem implementation that stores files in memory.

## Implements

- [`GenericFileSystem`](../interfaces/GenericFileSystem.md)

## Constructors

### constructor

• **new InMemoryFileSystem**()

## Properties

### files

• `Private` **files**: `Record`<`string`, `any`\> = `{}`

#### Defined in

[storage/FileSystem.ts:25](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/storage/FileSystem.ts#L25)

## Methods

### access

▸ **access**(`path`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

`Promise`<`void`\>

#### Implementation of

[GenericFileSystem](../interfaces/GenericFileSystem.md).[access](../interfaces/GenericFileSystem.md#access)

#### Defined in

[storage/FileSystem.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/storage/FileSystem.ts#L38)

___

### mkdir

▸ **mkdir**(`path`, `options?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `options?` | `any` |

#### Returns

`Promise`<`void`\>

#### Implementation of

[GenericFileSystem](../interfaces/GenericFileSystem.md).[mkdir](../interfaces/GenericFileSystem.md#mkdir)

#### Defined in

[storage/FileSystem.ts:44](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/storage/FileSystem.ts#L44)

___

### readFile

▸ **readFile**(`path`, `options?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `options?` | `any` |

#### Returns

`Promise`<`string`\>

#### Implementation of

[GenericFileSystem](../interfaces/GenericFileSystem.md).[readFile](../interfaces/GenericFileSystem.md#readfile)

#### Defined in

[storage/FileSystem.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/storage/FileSystem.ts#L31)

___

### writeFile

▸ **writeFile**(`path`, `content`, `options?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `content` | `string` |
| `options?` | `any` |

#### Returns

`Promise`<`void`\>

#### Implementation of

[GenericFileSystem](../interfaces/GenericFileSystem.md).[writeFile](../interfaces/GenericFileSystem.md#writefile)

#### Defined in

[storage/FileSystem.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/f264211/packages/core/src/storage/FileSystem.ts#L27)
