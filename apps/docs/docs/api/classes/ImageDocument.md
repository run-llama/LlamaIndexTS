---
id: "ImageDocument"
title: "Class: ImageDocument"
sidebar_label: "ImageDocument"
sidebar_position: 0
custom_edit_url: null
---

Generic abstract class for retrievable nodes

## Hierarchy

- [`Document`](Document.md)

  ↳ **`ImageDocument`**

## Constructors

### constructor

• **new ImageDocument**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`Document`](Document.md)\> |

#### Inherited from

[Document](Document.md).[constructor](Document.md#constructor)

#### Defined in

[Node.ts:210](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L210)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Inherited from

[Document](Document.md).[embedding](Document.md#embedding)

#### Defined in

[Node.ts:39](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L39)

___

### endCharIdx

• `Optional` **endCharIdx**: `number`

#### Inherited from

[Document](Document.md).[endCharIdx](Document.md#endcharidx)

#### Defined in

[Node.ts:136](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L136)

___

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Inherited from

[Document](Document.md).[excludedEmbedMetadataKeys](Document.md#excludedembedmetadatakeys)

#### Defined in

[Node.ts:43](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L43)

___

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Inherited from

[Document](Document.md).[excludedLlmMetadataKeys](Document.md#excludedllmmetadatakeys)

#### Defined in

[Node.ts:44](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L44)

___

### hash

• **hash**: `string` = `""`

#### Inherited from

[Document](Document.md).[hash](Document.md#hash)

#### Defined in

[Node.ts:46](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L46)

___

### id\_

• **id\_**: `string`

#### Inherited from

[Document](Document.md).[id_](Document.md#id_)

#### Defined in

[Node.ts:38](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L38)

___

### image

• `Optional` **image**: `string`

#### Defined in

[Node.ts:225](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L225)

___

### metadata

• **metadata**: `Record`<`string`, `any`\> = `{}`

#### Inherited from

[Document](Document.md).[metadata](Document.md#metadata)

#### Defined in

[Node.ts:42](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L42)

___

### metadataSeparator

• **metadataSeparator**: `string` = `"\n"`

#### Inherited from

[Document](Document.md).[metadataSeparator](Document.md#metadataseparator)

#### Defined in

[Node.ts:139](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L139)

___

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../modules.md#relatednodetype)\>\> = `{}`

#### Inherited from

[Document](Document.md).[relationships](Document.md#relationships)

#### Defined in

[Node.ts:45](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L45)

___

### startCharIdx

• `Optional` **startCharIdx**: `number`

#### Inherited from

[Document](Document.md).[startCharIdx](Document.md#startcharidx)

#### Defined in

[Node.ts:135](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L135)

___

### text

• **text**: `string` = `""`

#### Inherited from

[Document](Document.md).[text](Document.md#text)

#### Defined in

[Node.ts:134](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L134)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Inherited from

Document.childNodes

#### Defined in

[Node.ts:104](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L104)

___

### docId

• `get` **docId**(): `string`

#### Returns

`string`

#### Inherited from

Document.docId

#### Defined in

[Node.ts:219](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L219)

___

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

Document.nextNode

#### Defined in

[Node.ts:84](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L84)

___

### nodeId

• `get` **nodeId**(): `string`

#### Returns

`string`

#### Inherited from

Document.nodeId

#### Defined in

[Node.ts:58](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L58)

___

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

Document.parentNode

#### Defined in

[Node.ts:94](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L94)

___

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

Document.prevNode

#### Defined in

[Node.ts:72](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L72)

___

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

Document.sourceNode

#### Defined in

[Node.ts:62](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L62)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

[Document](Document.md).[asRelatedNodeInfo](Document.md#asrelatednodeinfo)

#### Defined in

[Node.ts:124](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L124)

___

### generateHash

▸ **generateHash**(): `void`

#### Returns

`void`

#### Inherited from

[Document](Document.md).[generateHash](Document.md#generatehash)

#### Defined in

[Node.ts:146](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L146)

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

[Document](Document.md).[getContent](Document.md#getcontent)

#### Defined in

[Node.ts:154](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L154)

___

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Inherited from

[Document](Document.md).[getEmbedding](Document.md#getembedding)

#### Defined in

[Node.ts:116](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L116)

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

[Document](Document.md).[getMetadataStr](Document.md#getmetadatastr)

#### Defined in

[Node.ts:159](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L159)

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

[Document](Document.md).[getNodeInfo](Document.md#getnodeinfo)

#### Defined in

[Node.ts:184](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L184)

___

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Inherited from

[Document](Document.md).[getText](Document.md#gettext)

#### Defined in

[Node.ts:188](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L188)

___

### getType

▸ **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Inherited from

[Document](Document.md).[getType](Document.md#gettype)

#### Defined in

[Node.ts:215](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L215)

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

[Document](Document.md).[setContent](Document.md#setcontent)

#### Defined in

[Node.ts:180](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L180)
