---
id: "BaseNode"
title: "Class: BaseNode<T>"
sidebar_label: "BaseNode"
sidebar_position: 0
custom_edit_url: null
---

Generic abstract class for retrievable nodes

## Type parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `T`  | extends [`Metadata`](../#metadata) = [`Metadata`](../#metadata) |

## Hierarchy

- **`BaseNode`**

  ↳ [`TextNode`](TextNode.md)

## Constructors

### constructor

• **new BaseNode**<`T`\>(`init?`)

#### Type parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `T`  | extends [`Metadata`](../#metadata) = [`Metadata`](../#metadata) |

#### Parameters

| Name    | Type                                        |
| :------ | :------------------------------------------ |
| `init?` | `Partial`<[`BaseNode`](BaseNode.md)<`T`\>\> |

#### Defined in

[packages/core/src/Node.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L60)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Defined in

[packages/core/src/Node.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L51)

---

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Defined in

[packages/core/src/Node.ts:55](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L55)

---

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Defined in

[packages/core/src/Node.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L56)

---

### hash

• **hash**: `string` = `""`

#### Defined in

[packages/core/src/Node.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L58)

---

### id\_

• **id\_**: `string`

The unique ID of the Node/Document. The trailing underscore is here
to avoid collisions with the id keyword in Python.

Set to a UUID by default.

#### Defined in

[packages/core/src/Node.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L50)

---

### metadata

• **metadata**: `T`

#### Defined in

[packages/core/src/Node.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L54)

---

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../#relatednodetype)<`T`\>\>\> = `{}`

#### Defined in

[packages/core/src/Node.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L57)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Defined in

[packages/core/src/Node.ts:112](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L112)

---

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Defined in

[packages/core/src/Node.ts:92](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L92)

---

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Defined in

[packages/core/src/Node.ts:102](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L102)

---

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Defined in

[packages/core/src/Node.ts:80](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L80)

---

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Defined in

[packages/core/src/Node.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L70)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Defined in

[packages/core/src/Node.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L134)

---

### generateHash

▸ `Abstract` **generateHash**(): `string`

#### Returns

`string`

#### Defined in

[packages/core/src/Node.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L124)

---

### getContent

▸ `Abstract` **getContent**(`metadataMode`): `string`

#### Parameters

| Name           | Type                                       |
| :------------- | :----------------------------------------- |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) |

#### Returns

`string`

#### Defined in

[packages/core/src/Node.ts:66](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L66)

---

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Defined in

[packages/core/src/Node.ts:126](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L126)

---

### getMetadataStr

▸ `Abstract` **getMetadataStr**(`metadataMode`): `string`

#### Parameters

| Name           | Type                                       |
| :------------- | :----------------------------------------- |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) |

#### Returns

`string`

#### Defined in

[packages/core/src/Node.ts:67](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L67)

---

### getType

▸ `Abstract` **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Defined in

[packages/core/src/Node.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L64)

---

### setContent

▸ `Abstract` **setContent**(`value`): `void`

#### Parameters

| Name    | Type  |
| :------ | :---- |
| `value` | `any` |

#### Returns

`void`

#### Defined in

[packages/core/src/Node.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L68)

---

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

Used with built in JSON.stringify

#### Returns

`Record`<`string`, `any`\>

#### Defined in

[packages/core/src/Node.ts:146](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L146)
