---
id: "TextNode"
title: "Class: TextNode"
sidebar_label: "TextNode"
sidebar_position: 0
custom_edit_url: null
---

TextNode is the default node type for text. Most common node type in LlamaIndex.TS

## Hierarchy

- [`BaseNode`](BaseNode.md)

  ↳ **`TextNode`**

  ↳↳ [`IndexNode`](IndexNode.md)

  ↳↳ [`Document`](Document.md)

## Constructors

### constructor

• **new TextNode**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`TextNode`](TextNode.md)\> |

#### Overrides

[BaseNode](BaseNode.md).[constructor](BaseNode.md#constructor)

#### Defined in

[Node.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L157)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Inherited from

[BaseNode](BaseNode.md).[embedding](BaseNode.md#embedding)

#### Defined in

[Node.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L46)

___

### endCharIdx

• `Optional` **endCharIdx**: `number`

#### Defined in

[Node.ts:152](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L152)

___

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Inherited from

[BaseNode](BaseNode.md).[excludedEmbedMetadataKeys](BaseNode.md#excludedembedmetadatakeys)

#### Defined in

[Node.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L50)

___

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Inherited from

[BaseNode](BaseNode.md).[excludedLlmMetadataKeys](BaseNode.md#excludedllmmetadatakeys)

#### Defined in

[Node.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L51)

___

### hash

• **hash**: `string` = `""`

#### Inherited from

[BaseNode](BaseNode.md).[hash](BaseNode.md#hash)

#### Defined in

[Node.ts:53](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L53)

___

### id\_

• **id\_**: `string`

The unique ID of the Node/Document. The trailing underscore is here
to avoid collisions with the id keyword in Python.

Set to a UUID by default.

#### Inherited from

[BaseNode](BaseNode.md).[id_](BaseNode.md#id_)

#### Defined in

[Node.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L45)

___

### metadata

• **metadata**: `Record`<`string`, `any`\> = `{}`

#### Inherited from

[BaseNode](BaseNode.md).[metadata](BaseNode.md#metadata)

#### Defined in

[Node.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L49)

___

### metadataSeparator

• **metadataSeparator**: `string` = `"\n"`

#### Defined in

[Node.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L155)

___

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../modules.md#relatednodetype)\>\> = `{}`

#### Inherited from

[BaseNode](BaseNode.md).[relationships](BaseNode.md#relationships)

#### Defined in

[Node.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L52)

___

### startCharIdx

• `Optional` **startCharIdx**: `number`

#### Defined in

[Node.ts:151](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L151)

___

### text

• **text**: `string` = `""`

#### Defined in

[Node.ts:150](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L150)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Inherited from

BaseNode.childNodes

#### Defined in

[Node.ts:107](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L107)

___

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

BaseNode.nextNode

#### Defined in

[Node.ts:87](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L87)

___

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

BaseNode.parentNode

#### Defined in

[Node.ts:97](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L97)

___

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

BaseNode.prevNode

#### Defined in

[Node.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L75)

___

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

BaseNode.sourceNode

#### Defined in

[Node.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L65)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

[BaseNode](BaseNode.md).[asRelatedNodeInfo](BaseNode.md#asrelatednodeinfo)

#### Defined in

[Node.ts:129](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L129)

___

### generateHash

▸ **generateHash**(): `string`

Generate a hash of the text node.
The ID is not part of the hash as it can change independent of content.

#### Returns

`string`

#### Overrides

[BaseNode](BaseNode.md).[generateHash](BaseNode.md#generatehash)

#### Defined in

[Node.ts:173](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L173)

___

### getContent

▸ **getContent**(`metadataMode?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) | `MetadataMode.NONE` |

#### Returns

`string`

#### Overrides

[BaseNode](BaseNode.md).[getContent](BaseNode.md#getcontent)

#### Defined in

[Node.ts:187](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L187)

___

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Inherited from

[BaseNode](BaseNode.md).[getEmbedding](BaseNode.md#getembedding)

#### Defined in

[Node.ts:121](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L121)

___

### getMetadataStr

▸ **getMetadataStr**(`metadataMode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) |

#### Returns

`string`

#### Overrides

[BaseNode](BaseNode.md).[getMetadataStr](BaseNode.md#getmetadatastr)

#### Defined in

[Node.ts:192](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L192)

___

### getNodeInfo

▸ **getNodeInfo**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `end` | `undefined` \| `number` |
| `start` | `undefined` \| `number` |

#### Defined in

[Node.ts:219](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L219)

___

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Defined in

[Node.ts:223](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L223)

___

### getType

▸ **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Overrides

[BaseNode](BaseNode.md).[getType](BaseNode.md#gettype)

#### Defined in

[Node.ts:183](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L183)

___

### setContent

▸ **setContent**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`void`

#### Overrides

[BaseNode](BaseNode.md).[setContent](BaseNode.md#setcontent)

#### Defined in

[Node.ts:213](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L213)

___

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

Used with built in JSON.stringify

#### Returns

`Record`<`string`, `any`\>

#### Inherited from

[BaseNode](BaseNode.md).[toJSON](BaseNode.md#tojson)

#### Defined in

[Node.ts:141](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L141)
