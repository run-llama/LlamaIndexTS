---
id: "Document"
title: "Class: Document"
sidebar_label: "Document"
sidebar_position: 0
custom_edit_url: null
---

A document is just a special text node with a docId.

## Hierarchy

- [`TextNode`](TextNode.md)

  ↳ **`Document`**

## Constructors

### constructor

• **new Document**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`Document`](Document.md)\> |

#### Overrides

[TextNode](TextNode.md).[constructor](TextNode.md#constructor)

#### Defined in

[Node.ts:216](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L216)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Inherited from

[TextNode](TextNode.md).[embedding](TextNode.md#embedding)

#### Defined in

[Node.ts:39](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L39)

___

### endCharIdx

• `Optional` **endCharIdx**: `number`

#### Inherited from

[TextNode](TextNode.md).[endCharIdx](TextNode.md#endcharidx)

#### Defined in

[Node.ts:139](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L139)

___

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Inherited from

[TextNode](TextNode.md).[excludedEmbedMetadataKeys](TextNode.md#excludedembedmetadatakeys)

#### Defined in

[Node.ts:43](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L43)

___

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Inherited from

[TextNode](TextNode.md).[excludedLlmMetadataKeys](TextNode.md#excludedllmmetadatakeys)

#### Defined in

[Node.ts:44](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L44)

___

### hash

• **hash**: `string` = `""`

#### Inherited from

[TextNode](TextNode.md).[hash](TextNode.md#hash)

#### Defined in

[Node.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L46)

___

### id\_

• **id\_**: `string`

#### Inherited from

[TextNode](TextNode.md).[id_](TextNode.md#id_)

#### Defined in

[Node.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L38)

___

### metadata

• **metadata**: `Record`<`string`, `any`\> = `{}`

#### Inherited from

[TextNode](TextNode.md).[metadata](TextNode.md#metadata)

#### Defined in

[Node.ts:42](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L42)

___

### metadataSeparator

• **metadataSeparator**: `string` = `"\n"`

#### Inherited from

[TextNode](TextNode.md).[metadataSeparator](TextNode.md#metadataseparator)

#### Defined in

[Node.ts:142](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L142)

___

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../modules.md#relatednodetype)\>\> = `{}`

#### Inherited from

[TextNode](TextNode.md).[relationships](TextNode.md#relationships)

#### Defined in

[Node.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L45)

___

### startCharIdx

• `Optional` **startCharIdx**: `number`

#### Inherited from

[TextNode](TextNode.md).[startCharIdx](TextNode.md#startcharidx)

#### Defined in

[Node.ts:138](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L138)

___

### text

• **text**: `string` = `""`

#### Inherited from

[TextNode](TextNode.md).[text](TextNode.md#text)

#### Defined in

[Node.ts:137](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L137)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Inherited from

TextNode.childNodes

#### Defined in

[Node.ts:104](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L104)

___

### docId

• `get` **docId**(): `string`

#### Returns

`string`

#### Defined in

[Node.ts:225](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L225)

___

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

TextNode.nextNode

#### Defined in

[Node.ts:84](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L84)

___

### nodeId

• `get` **nodeId**(): `string`

#### Returns

`string`

#### Inherited from

TextNode.nodeId

#### Defined in

[Node.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L58)

___

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

TextNode.parentNode

#### Defined in

[Node.ts:94](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L94)

___

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

TextNode.prevNode

#### Defined in

[Node.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L72)

___

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

TextNode.sourceNode

#### Defined in

[Node.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L62)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

[TextNode](TextNode.md).[asRelatedNodeInfo](TextNode.md#asrelatednodeinfo)

#### Defined in

[Node.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L124)

___

### generateHash

▸ **generateHash**(): `void`

#### Returns

`void`

#### Inherited from

[TextNode](TextNode.md).[generateHash](TextNode.md#generatehash)

#### Defined in

[Node.ts:149](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L149)

___

### getContent

▸ **getContent**(`metadataMode?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) | `MetadataMode.NONE` |

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[getContent](TextNode.md#getcontent)

#### Defined in

[Node.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L157)

___

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Inherited from

[TextNode](TextNode.md).[getEmbedding](TextNode.md#getembedding)

#### Defined in

[Node.ts:116](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L116)

___

### getMetadataStr

▸ **getMetadataStr**(`metadataMode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) |

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[getMetadataStr](TextNode.md#getmetadatastr)

#### Defined in

[Node.ts:162](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L162)

___

### getNodeInfo

▸ **getNodeInfo**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `end` | `undefined` \| `number` |
| `start` | `undefined` \| `number` |

#### Inherited from

[TextNode](TextNode.md).[getNodeInfo](TextNode.md#getnodeinfo)

#### Defined in

[Node.ts:187](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L187)

___

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[getText](TextNode.md#gettext)

#### Defined in

[Node.ts:191](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L191)

___

### getType

▸ **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Overrides

[TextNode](TextNode.md).[getType](TextNode.md#gettype)

#### Defined in

[Node.ts:221](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L221)

___

### setContent

▸ **setContent**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`void`

#### Inherited from

[TextNode](TextNode.md).[setContent](TextNode.md#setcontent)

#### Defined in

[Node.ts:183](https://github.com/run-llama/LlamaIndexTS/blob/2db8a8c/packages/core/src/Node.ts#L183)
