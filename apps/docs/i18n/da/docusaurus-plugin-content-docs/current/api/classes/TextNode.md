---
id: "TextNode"
title: "Class: TextNode<T>"
sidebar_label: "TextNode"
sidebar_position: 0
custom_edit_url: null
---

TextNode is the default node type for text. Most common node type in LlamaIndex.TS

## Type parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `T`  | extends [`Metadata`](../#metadata) = [`Metadata`](../#metadata) |

## Hierarchy

- [`BaseNode`](BaseNode.md)<`T`\>

  ↳ **`TextNode`**

  ↳↳ [`IndexNode`](IndexNode.md)

  ↳↳ [`Document`](Document.md)

  ↳↳ [`ImageNode`](ImageNode.md)

## Constructors

### constructor

• **new TextNode**<`T`\>(`init?`)

#### Type parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `T`  | extends [`Metadata`](../#metadata) = [`Metadata`](../#metadata) |

#### Parameters

| Name    | Type                                        |
| :------ | :------------------------------------------ |
| `init?` | `Partial`<[`TextNode`](TextNode.md)<`T`\>\> |

#### Overrides

[BaseNode](BaseNode.md).[constructor](BaseNode.md#constructor)

#### Defined in

[packages/core/src/Node.ts:162](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L162)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Inherited from

[BaseNode](BaseNode.md).[embedding](BaseNode.md#embedding)

#### Defined in

[packages/core/src/Node.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L51)

---

### endCharIdx

• `Optional` **endCharIdx**: `number`

#### Defined in

[packages/core/src/Node.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L157)

---

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Inherited from

[BaseNode](BaseNode.md).[excludedEmbedMetadataKeys](BaseNode.md#excludedembedmetadatakeys)

#### Defined in

[packages/core/src/Node.ts:55](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L55)

---

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Inherited from

[BaseNode](BaseNode.md).[excludedLlmMetadataKeys](BaseNode.md#excludedllmmetadatakeys)

#### Defined in

[packages/core/src/Node.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L56)

---

### hash

• **hash**: `string` = `""`

#### Inherited from

[BaseNode](BaseNode.md).[hash](BaseNode.md#hash)

#### Defined in

[packages/core/src/Node.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L58)

---

### id\_

• **id\_**: `string`

The unique ID of the Node/Document. The trailing underscore is here
to avoid collisions with the id keyword in Python.

Set to a UUID by default.

#### Inherited from

[BaseNode](BaseNode.md).[id\_](BaseNode.md#id_)

#### Defined in

[packages/core/src/Node.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L50)

---

### metadata

• **metadata**: `T`

#### Inherited from

[BaseNode](BaseNode.md).[metadata](BaseNode.md#metadata)

#### Defined in

[packages/core/src/Node.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L54)

---

### metadataSeparator

• **metadataSeparator**: `string` = `"\n"`

#### Defined in

[packages/core/src/Node.ts:160](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L160)

---

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../#relatednodetype)<`T`\>\>\> = `{}`

#### Inherited from

[BaseNode](BaseNode.md).[relationships](BaseNode.md#relationships)

#### Defined in

[packages/core/src/Node.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L57)

---

### startCharIdx

• `Optional` **startCharIdx**: `number`

#### Defined in

[packages/core/src/Node.ts:156](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L156)

---

### text

• **text**: `string` = `""`

#### Defined in

[packages/core/src/Node.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L155)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Inherited from

BaseNode.childNodes

#### Defined in

[packages/core/src/Node.ts:112](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L112)

---

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

BaseNode.nextNode

#### Defined in

[packages/core/src/Node.ts:92](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L92)

---

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

BaseNode.parentNode

#### Defined in

[packages/core/src/Node.ts:102](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L102)

---

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

BaseNode.prevNode

#### Defined in

[packages/core/src/Node.ts:80](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L80)

---

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

BaseNode.sourceNode

#### Defined in

[packages/core/src/Node.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L70)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

[BaseNode](BaseNode.md).[asRelatedNodeInfo](BaseNode.md#asrelatednodeinfo)

#### Defined in

[packages/core/src/Node.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L134)

---

### generateHash

▸ **generateHash**(): `string`

Generate a hash of the text node.
The ID is not part of the hash as it can change independent of content.

#### Returns

`string`

#### Overrides

[BaseNode](BaseNode.md).[generateHash](BaseNode.md#generatehash)

#### Defined in

[packages/core/src/Node.ts:178](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L178)

---

### getContent

▸ **getContent**(`metadataMode?`): `string`

#### Parameters

| Name           | Type                                       | Default value       |
| :------------- | :----------------------------------------- | :------------------ |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) | `MetadataMode.NONE` |

#### Returns

`string`

#### Overrides

[BaseNode](BaseNode.md).[getContent](BaseNode.md#getcontent)

#### Defined in

[packages/core/src/Node.ts:192](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L192)

---

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Inherited from

[BaseNode](BaseNode.md).[getEmbedding](BaseNode.md#getembedding)

#### Defined in

[packages/core/src/Node.ts:126](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L126)

---

### getMetadataStr

▸ **getMetadataStr**(`metadataMode`): `string`

#### Parameters

| Name           | Type                                       |
| :------------- | :----------------------------------------- |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) |

#### Returns

`string`

#### Overrides

[BaseNode](BaseNode.md).[getMetadataStr](BaseNode.md#getmetadatastr)

#### Defined in

[packages/core/src/Node.ts:197](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L197)

---

### getNodeInfo

▸ **getNodeInfo**(): `Object`

#### Returns

`Object`

| Name    | Type                    |
| :------ | :---------------------- |
| `end`   | `undefined` \| `number` |
| `start` | `undefined` \| `number` |

#### Defined in

[packages/core/src/Node.ts:224](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L224)

---

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Defined in

[packages/core/src/Node.ts:228](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L228)

---

### getType

▸ **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Overrides

[BaseNode](BaseNode.md).[getType](BaseNode.md#gettype)

#### Defined in

[packages/core/src/Node.ts:188](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L188)

---

### setContent

▸ **setContent**(`value`): `void`

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `value` | `string` |

#### Returns

`void`

#### Overrides

[BaseNode](BaseNode.md).[setContent](BaseNode.md#setcontent)

#### Defined in

[packages/core/src/Node.ts:218](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L218)

---

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

Used with built in JSON.stringify

#### Returns

`Record`<`string`, `any`\>

#### Inherited from

[BaseNode](BaseNode.md).[toJSON](BaseNode.md#tojson)

#### Defined in

[packages/core/src/Node.ts:146](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L146)
