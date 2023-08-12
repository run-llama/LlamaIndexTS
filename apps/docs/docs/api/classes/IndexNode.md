---
id: "IndexNode"
title: "Class: IndexNode"
sidebar_label: "IndexNode"
sidebar_position: 0
custom_edit_url: null
---

TextNode is the default node type for text. Most common node type in LlamaIndex.TS

## Hierarchy

- [`TextNode`](TextNode.md)

  ↳ **`IndexNode`**

## Constructors

### constructor

• **new IndexNode**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`IndexNode`](IndexNode.md)\> |

#### Overrides

[TextNode](TextNode.md).[constructor](TextNode.md#constructor)

#### Defined in

[Node.ts:239](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L239)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Inherited from

[TextNode](TextNode.md).[embedding](TextNode.md#embedding)

#### Defined in

[Node.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L46)

___

### endCharIdx

• `Optional` **endCharIdx**: `number`

#### Inherited from

[TextNode](TextNode.md).[endCharIdx](TextNode.md#endcharidx)

#### Defined in

[Node.ts:152](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L152)

___

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Inherited from

[TextNode](TextNode.md).[excludedEmbedMetadataKeys](TextNode.md#excludedembedmetadatakeys)

#### Defined in

[Node.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L50)

___

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Inherited from

[TextNode](TextNode.md).[excludedLlmMetadataKeys](TextNode.md#excludedllmmetadatakeys)

#### Defined in

[Node.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L51)

___

### hash

• **hash**: `string` = `""`

#### Inherited from

[TextNode](TextNode.md).[hash](TextNode.md#hash)

#### Defined in

[Node.ts:53](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L53)

___

### id\_

• **id\_**: `string`

The unique ID of the Node/Document. The trailing underscore is here
to avoid collisions with the id keyword in Python.

Set to a UUID by default.

#### Inherited from

[TextNode](TextNode.md).[id_](TextNode.md#id_)

#### Defined in

[Node.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L45)

___

### indexId

• **indexId**: `string` = `""`

#### Defined in

[Node.ts:237](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L237)

___

### metadata

• **metadata**: `Record`<`string`, `any`\> = `{}`

#### Inherited from

[TextNode](TextNode.md).[metadata](TextNode.md#metadata)

#### Defined in

[Node.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L49)

___

### metadataSeparator

• **metadataSeparator**: `string` = `"\n"`

#### Inherited from

[TextNode](TextNode.md).[metadataSeparator](TextNode.md#metadataseparator)

#### Defined in

[Node.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L155)

___

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../modules.md#relatednodetype)\>\> = `{}`

#### Inherited from

[TextNode](TextNode.md).[relationships](TextNode.md#relationships)

#### Defined in

[Node.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L52)

___

### startCharIdx

• `Optional` **startCharIdx**: `number`

#### Inherited from

[TextNode](TextNode.md).[startCharIdx](TextNode.md#startcharidx)

#### Defined in

[Node.ts:151](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L151)

___

### text

• **text**: `string` = `""`

#### Inherited from

[TextNode](TextNode.md).[text](TextNode.md#text)

#### Defined in

[Node.ts:150](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L150)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Inherited from

TextNode.childNodes

#### Defined in

[Node.ts:107](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L107)

___

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

TextNode.nextNode

#### Defined in

[Node.ts:87](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L87)

___

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

TextNode.parentNode

#### Defined in

[Node.ts:97](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L97)

___

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

TextNode.prevNode

#### Defined in

[Node.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L75)

___

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

TextNode.sourceNode

#### Defined in

[Node.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L65)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

[TextNode](TextNode.md).[asRelatedNodeInfo](TextNode.md#asrelatednodeinfo)

#### Defined in

[Node.ts:129](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L129)

___

### generateHash

▸ **generateHash**(): `string`

Generate a hash of the text node.
The ID is not part of the hash as it can change independent of content.

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[generateHash](TextNode.md#generatehash)

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

#### Inherited from

[TextNode](TextNode.md).[getContent](TextNode.md#getcontent)

#### Defined in

[Node.ts:187](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L187)

___

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Inherited from

[TextNode](TextNode.md).[getEmbedding](TextNode.md#getembedding)

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

#### Inherited from

[TextNode](TextNode.md).[getMetadataStr](TextNode.md#getmetadatastr)

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

#### Inherited from

[TextNode](TextNode.md).[getNodeInfo](TextNode.md#getnodeinfo)

#### Defined in

[Node.ts:219](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L219)

___

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[getText](TextNode.md#gettext)

#### Defined in

[Node.ts:223](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L223)

___

### getType

▸ **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Overrides

[TextNode](TextNode.md).[getType](TextNode.md#gettype)

#### Defined in

[Node.ts:248](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L248)

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

[Node.ts:213](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L213)

___

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

Used with built in JSON.stringify

#### Returns

`Record`<`string`, `any`\>

#### Inherited from

[TextNode](TextNode.md).[toJSON](TextNode.md#tojson)

#### Defined in

[Node.ts:141](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L141)
