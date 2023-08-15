---
id: "BaseNode"
title: "Class: BaseNode"
sidebar_label: "BaseNode"
sidebar_position: 0
custom_edit_url: null
---

Generic abstract class for retrievable nodes

## Hierarchy

- **`BaseNode`**

  ↳ [`TextNode`](TextNode.md)

## Constructors

### constructor

• **new BaseNode**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`BaseNode`](BaseNode.md)\> |

#### Defined in

[Node.ts:55](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L55)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Defined in

[Node.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L46)

___

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Defined in

[Node.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L50)

___

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Defined in

[Node.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L51)

___

### hash

• **hash**: `string` = `""`

#### Defined in

[Node.ts:53](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L53)

___

### id\_

• **id\_**: `string`

The unique ID of the Node/Document. The trailing underscore is here
to avoid collisions with the id keyword in Python.

Set to a UUID by default.

#### Defined in

[Node.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L45)

___

### metadata

• **metadata**: `Record`<`string`, `any`\> = `{}`

#### Defined in

[Node.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L49)

___

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../modules.md#relatednodetype)\>\> = `{}`

#### Defined in

[Node.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L52)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Defined in

[Node.ts:107](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L107)

___

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:87](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L87)

___

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:97](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L97)

___

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L75)

___

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L65)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:129](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L129)

___

### generateHash

▸ `Abstract` **generateHash**(): `string`

#### Returns

`string`

#### Defined in

[Node.ts:119](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L119)

___

### getContent

▸ `Abstract` **getContent**(`metadataMode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) |

#### Returns

`string`

#### Defined in

[Node.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L61)

___

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Defined in

[Node.ts:121](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L121)

___

### getMetadataStr

▸ `Abstract` **getMetadataStr**(`metadataMode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) |

#### Returns

`string`

#### Defined in

[Node.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L62)

___

### getType

▸ `Abstract` **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Defined in

[Node.ts:59](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L59)

___

### setContent

▸ `Abstract` **setContent**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`void`

#### Defined in

[Node.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L63)

___

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

Used with built in JSON.stringify

#### Returns

`Record`<`string`, `any`\>

#### Defined in

[Node.ts:141](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L141)
