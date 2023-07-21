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

[Node.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L48)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Defined in

[Node.ts:39](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L39)

___

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Defined in

[Node.ts:43](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L43)

___

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Defined in

[Node.ts:44](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L44)

___

### hash

• **hash**: `string` = `""`

#### Defined in

[Node.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L46)

___

### id\_

• **id\_**: `string`

#### Defined in

[Node.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L38)

___

### metadata

• **metadata**: `Record`<`string`, `any`\> = `{}`

#### Defined in

[Node.ts:42](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L42)

___

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../modules.md#relatednodetype)\>\> = `{}`

#### Defined in

[Node.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L45)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Defined in

[Node.ts:104](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L104)

___

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:84](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L84)

___

### nodeId

• `get` **nodeId**(): `string`

#### Returns

`string`

#### Defined in

[Node.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L58)

___

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:94](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L94)

___

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L72)

___

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L62)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Defined in

[Node.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L124)

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

[Node.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L54)

___

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Defined in

[Node.ts:116](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L116)

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

[Node.ts:55](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L55)

___

### getType

▸ `Abstract` **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Defined in

[Node.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L52)

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

[Node.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L56)
