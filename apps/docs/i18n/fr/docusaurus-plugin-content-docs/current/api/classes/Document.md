---
id: "Document"
title: "Class: Document<T>"
sidebar_label: "Document"
sidebar_position: 0
custom_edit_url: null
---

A document is just a special text node with a docId.

## Type parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `T`  | extends [`Metadata`](../#metadata) = [`Metadata`](../#metadata) |

## Hierarchy

- [`TextNode`](TextNode.md)<`T`\>

  ↳ **`Document`**

## Constructors

### constructor

• **new Document**<`T`\>(`init?`)

#### Type parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `T`  | extends [`Metadata`](../#metadata) = [`Metadata`](../#metadata) |

#### Parameters

| Name    | Type                                        |
| :------ | :------------------------------------------ |
| `init?` | `Partial`<[`Document`](Document.md)<`T`\>\> |

#### Overrides

[TextNode](TextNode.md).[constructor](TextNode.md#constructor)

#### Defined in

[packages/core/src/Node.ts:254](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L254)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Inherited from

[TextNode](TextNode.md).[embedding](TextNode.md#embedding)

#### Defined in

[packages/core/src/Node.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L51)

---

### endCharIdx

• `Optional` **endCharIdx**: `number`

#### Inherited from

[TextNode](TextNode.md).[endCharIdx](TextNode.md#endcharidx)

#### Defined in

[packages/core/src/Node.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L157)

---

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Inherited from

[TextNode](TextNode.md).[excludedEmbedMetadataKeys](TextNode.md#excludedembedmetadatakeys)

#### Defined in

[packages/core/src/Node.ts:55](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L55)

---

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Inherited from

[TextNode](TextNode.md).[excludedLlmMetadataKeys](TextNode.md#excludedllmmetadatakeys)

#### Defined in

[packages/core/src/Node.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L56)

---

### hash

• **hash**: `string` = `""`

#### Inherited from

[TextNode](TextNode.md).[hash](TextNode.md#hash)

#### Defined in

[packages/core/src/Node.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L58)

---

### id\_

• **id\_**: `string`

The unique ID of the Node/Document. The trailing underscore is here
to avoid collisions with the id keyword in Python.

Set to a UUID by default.

#### Inherited from

[TextNode](TextNode.md).[id\_](TextNode.md#id_)

#### Defined in

[packages/core/src/Node.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L50)

---

### metadata

• **metadata**: `T`

#### Inherited from

[TextNode](TextNode.md).[metadata](TextNode.md#metadata)

#### Defined in

[packages/core/src/Node.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L54)

---

### metadataSeparator

• **metadataSeparator**: `string` = `"\n"`

#### Inherited from

[TextNode](TextNode.md).[metadataSeparator](TextNode.md#metadataseparator)

#### Defined in

[packages/core/src/Node.ts:160](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L160)

---

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../#relatednodetype)<`T`\>\>\> = `{}`

#### Inherited from

[TextNode](TextNode.md).[relationships](TextNode.md#relationships)

#### Defined in

[packages/core/src/Node.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L57)

---

### startCharIdx

• `Optional` **startCharIdx**: `number`

#### Inherited from

[TextNode](TextNode.md).[startCharIdx](TextNode.md#startcharidx)

#### Defined in

[packages/core/src/Node.ts:156](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L156)

---

### text

• **text**: `string` = `""`

#### Inherited from

[TextNode](TextNode.md).[text](TextNode.md#text)

#### Defined in

[packages/core/src/Node.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L155)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Inherited from

TextNode.childNodes

#### Defined in

[packages/core/src/Node.ts:112](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L112)

---

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

TextNode.nextNode

#### Defined in

[packages/core/src/Node.ts:92](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L92)

---

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

TextNode.parentNode

#### Defined in

[packages/core/src/Node.ts:102](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L102)

---

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

TextNode.prevNode

#### Defined in

[packages/core/src/Node.ts:80](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L80)

---

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

TextNode.sourceNode

#### Defined in

[packages/core/src/Node.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L70)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

[TextNode](TextNode.md).[asRelatedNodeInfo](TextNode.md#asrelatednodeinfo)

#### Defined in

[packages/core/src/Node.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L134)

---

### generateHash

▸ **generateHash**(): `string`

Generate a hash of the text node.
The ID is not part of the hash as it can change independent of content.

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[generateHash](TextNode.md#generatehash)

#### Defined in

[packages/core/src/Node.ts:178](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L178)

---

### getContent

▸ **getContent**(`metadataMode?`): `string`

#### Parameters

| Name           | Type                                       | Default value       |
| :------------- | :----------------------------------------- | :------------------ |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) | `MetadataMode.NONE` |

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[getContent](TextNode.md#getcontent)

#### Defined in

[packages/core/src/Node.ts:192](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L192)

---

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Inherited from

[TextNode](TextNode.md).[getEmbedding](TextNode.md#getembedding)

#### Defined in

[packages/core/src/Node.ts:126](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L126)

---

### getMetadataStr

▸ **getMetadataStr**(`metadataMode`): `string`

#### Parameters

| Name           | Type                                       |
| :------------- | :----------------------------------------- |
| `metadataMode` | [`MetadataMode`](../enums/MetadataMode.md) |

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[getMetadataStr](TextNode.md#getmetadatastr)

#### Defined in

[packages/core/src/Node.ts:197](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L197)

---

### getNodeInfo

▸ **getNodeInfo**(): `Object`

#### Returns

`Object`

| Name    | Type                    |
| :------ | :---------------------- |
| `end`   | `undefined` \| `number` |
| `start` | `undefined` \| `number` |

#### Inherited from

[TextNode](TextNode.md).[getNodeInfo](TextNode.md#getnodeinfo)

#### Defined in

[packages/core/src/Node.ts:224](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L224)

---

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Inherited from

[TextNode](TextNode.md).[getText](TextNode.md#gettext)

#### Defined in

[packages/core/src/Node.ts:228](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L228)

---

### getType

▸ **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Overrides

[TextNode](TextNode.md).[getType](TextNode.md#gettype)

#### Defined in

[packages/core/src/Node.ts:263](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L263)

---

### setContent

▸ **setContent**(`value`): `void`

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `value` | `string` |

#### Returns

`void`

#### Inherited from

[TextNode](TextNode.md).[setContent](TextNode.md#setcontent)

#### Defined in

[packages/core/src/Node.ts:218](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L218)

---

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

Used with built in JSON.stringify

#### Returns

`Record`<`string`, `any`\>

#### Inherited from

[TextNode](TextNode.md).[toJSON](TextNode.md#tojson)

#### Defined in

[packages/core/src/Node.ts:146](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Node.ts#L146)
