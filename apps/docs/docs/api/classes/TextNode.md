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

[Node.ts:144](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L144)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Inherited from

[BaseNode](BaseNode.md).[embedding](BaseNode.md#embedding)

#### Defined in

[Node.ts:39](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L39)

___

### endCharIdx

• `Optional` **endCharIdx**: `number`

#### Defined in

[Node.ts:139](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L139)

___

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Inherited from

[BaseNode](BaseNode.md).[excludedEmbedMetadataKeys](BaseNode.md#excludedembedmetadatakeys)

#### Defined in

[Node.ts:43](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L43)

___

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Inherited from

[BaseNode](BaseNode.md).[excludedLlmMetadataKeys](BaseNode.md#excludedllmmetadatakeys)

#### Defined in

[Node.ts:44](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L44)

___

### hash

• **hash**: `string` = `""`

#### Inherited from

[BaseNode](BaseNode.md).[hash](BaseNode.md#hash)

#### Defined in

[Node.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L46)

___

### id\_

• **id\_**: `string`

#### Inherited from

[BaseNode](BaseNode.md).[id_](BaseNode.md#id_)

#### Defined in

[Node.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L38)

___

### metadata

• **metadata**: `Record`<`string`, `any`\> = `{}`

#### Inherited from

[BaseNode](BaseNode.md).[metadata](BaseNode.md#metadata)

#### Defined in

[Node.ts:42](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L42)

___

### metadataSeparator

• **metadataSeparator**: `string` = `"\n"`

#### Defined in

[Node.ts:142](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L142)

___

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../modules.md#relatednodetype)\>\> = `{}`

#### Inherited from

[BaseNode](BaseNode.md).[relationships](BaseNode.md#relationships)

#### Defined in

[Node.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L45)

___

### startCharIdx

• `Optional` **startCharIdx**: `number`

#### Defined in

[Node.ts:138](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L138)

___

### text

• **text**: `string` = `""`

#### Defined in

[Node.ts:137](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L137)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)[]

#### Inherited from

BaseNode.childNodes

#### Defined in

[Node.ts:104](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L104)

___

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

BaseNode.nextNode

#### Defined in

[Node.ts:84](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L84)

___

### nodeId

• `get` **nodeId**(): `string`

#### Returns

`string`

#### Inherited from

BaseNode.nodeId

#### Defined in

[Node.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L58)

___

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

BaseNode.parentNode

#### Defined in

[Node.ts:94](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L94)

___

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

BaseNode.prevNode

#### Defined in

[Node.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L72)

___

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

BaseNode.sourceNode

#### Defined in

[Node.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L62)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)

#### Inherited from

[BaseNode](BaseNode.md).[asRelatedNodeInfo](BaseNode.md#asrelatednodeinfo)

#### Defined in

[Node.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L124)

___

### generateHash

▸ **generateHash**(): `void`

#### Returns

`void`

#### Defined in

[Node.ts:149](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L149)

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

[Node.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L157)

___

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Inherited from

[BaseNode](BaseNode.md).[getEmbedding](BaseNode.md#getembedding)

#### Defined in

[Node.ts:116](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L116)

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

[Node.ts:162](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L162)

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

[Node.ts:187](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L187)

___

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Defined in

[Node.ts:191](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L191)

___

### getType

▸ **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Overrides

[BaseNode](BaseNode.md).[getType](BaseNode.md#gettype)

#### Defined in

[Node.ts:153](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L153)

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

[Node.ts:183](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/Node.ts#L183)
