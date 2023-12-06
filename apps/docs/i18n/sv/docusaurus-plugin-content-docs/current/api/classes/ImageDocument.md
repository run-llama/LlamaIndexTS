---
id: "ImageDocument"
title: "Class: ImageDocument<T>"
sidebar_label: "ImageDocument"
sidebar_position: 0
custom_edit_url: null
---

TextNode is the default node type for text. Most common node type in LlamaIndex.TS

## Type parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `T`  | extends [`Metadata`](../#metadata) = [`Metadata`](../#metadata) |

## Hierarchy

- [`ImageNode`](ImageNode.md)<`T`\>

  ↳ **`ImageDocument`**

## Constructors

### constructor

• **new ImageDocument**<`T`\>(`init`)

#### Type parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `T`  | extends [`Metadata`](../#metadata) = [`Metadata`](../#metadata) |

#### Parameters

| Name   | Type                                                               |
| :----- | :----------------------------------------------------------------- |
| `init` | [`ImageNodeConstructorProps`](../#imagenodeconstructorprops)<`T`\> |

#### Overrides

[ImageNode](ImageNode.md).[constructor](ImageNode.md#constructor)

#### Defined in

[packages/core/src/Node.ts:310](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L310)

## Properties

### embedding

• `Optional` **embedding**: `number`[]

#### Inherited from

[ImageNode](ImageNode.md).[embedding](ImageNode.md#embedding)

#### Defined in

[packages/core/src/Node.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L51)

---

### endCharIdx

• `Optional` **endCharIdx**: `number`

#### Inherited from

[ImageNode](ImageNode.md).[endCharIdx](ImageNode.md#endcharidx)

#### Defined in

[packages/core/src/Node.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L157)

---

### excludedEmbedMetadataKeys

• **excludedEmbedMetadataKeys**: `string`[] = `[]`

#### Inherited from

[ImageNode](ImageNode.md).[excludedEmbedMetadataKeys](ImageNode.md#excludedembedmetadatakeys)

#### Defined in

[packages/core/src/Node.ts:55](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L55)

---

### excludedLlmMetadataKeys

• **excludedLlmMetadataKeys**: `string`[] = `[]`

#### Inherited from

[ImageNode](ImageNode.md).[excludedLlmMetadataKeys](ImageNode.md#excludedllmmetadatakeys)

#### Defined in

[packages/core/src/Node.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L56)

---

### hash

• **hash**: `string` = `""`

#### Inherited from

[ImageNode](ImageNode.md).[hash](ImageNode.md#hash)

#### Defined in

[packages/core/src/Node.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L58)

---

### id\_

• **id\_**: `string`

The unique ID of the Node/Document. The trailing underscore is here
to avoid collisions with the id keyword in Python.

Set to a UUID by default.

#### Inherited from

[ImageNode](ImageNode.md).[id\_](ImageNode.md#id_)

#### Defined in

[packages/core/src/Node.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L50)

---

### image

• **image**: [`ImageType`](../#imagetype)

#### Inherited from

[ImageNode](ImageNode.md).[image](ImageNode.md#image)

#### Defined in

[packages/core/src/Node.ts:297](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L297)

---

### metadata

• **metadata**: `T`

#### Inherited from

[ImageNode](ImageNode.md).[metadata](ImageNode.md#metadata)

#### Defined in

[packages/core/src/Node.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L54)

---

### metadataSeparator

• **metadataSeparator**: `string` = `"\n"`

#### Inherited from

[ImageNode](ImageNode.md).[metadataSeparator](ImageNode.md#metadataseparator)

#### Defined in

[packages/core/src/Node.ts:160](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L160)

---

### relationships

• **relationships**: `Partial`<`Record`<[`NodeRelationship`](../enums/NodeRelationship.md), [`RelatedNodeType`](../#relatednodetype)<`T`\>\>\> = `{}`

#### Inherited from

[ImageNode](ImageNode.md).[relationships](ImageNode.md#relationships)

#### Defined in

[packages/core/src/Node.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L57)

---

### startCharIdx

• `Optional` **startCharIdx**: `number`

#### Inherited from

[ImageNode](ImageNode.md).[startCharIdx](ImageNode.md#startcharidx)

#### Defined in

[packages/core/src/Node.ts:156](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L156)

---

### text

• **text**: `string` = `""`

#### Inherited from

[ImageNode](ImageNode.md).[text](ImageNode.md#text)

#### Defined in

[packages/core/src/Node.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L155)

## Accessors

### childNodes

• `get` **childNodes**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Inherited from

ImageNode.childNodes

#### Defined in

[packages/core/src/Node.ts:112](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L112)

---

### nextNode

• `get` **nextNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

ImageNode.nextNode

#### Defined in

[packages/core/src/Node.ts:92](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L92)

---

### parentNode

• `get` **parentNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

ImageNode.parentNode

#### Defined in

[packages/core/src/Node.ts:102](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L102)

---

### prevNode

• `get` **prevNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

ImageNode.prevNode

#### Defined in

[packages/core/src/Node.ts:80](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L80)

---

### sourceNode

• `get` **sourceNode**(): `undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

`undefined` \| [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

ImageNode.sourceNode

#### Defined in

[packages/core/src/Node.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L70)

## Methods

### asRelatedNodeInfo

▸ **asRelatedNodeInfo**(): [`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Returns

[`RelatedNodeInfo`](../interfaces/RelatedNodeInfo.md)<`T`\>

#### Inherited from

[ImageNode](ImageNode.md).[asRelatedNodeInfo](ImageNode.md#asrelatednodeinfo)

#### Defined in

[packages/core/src/Node.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L134)

---

### generateHash

▸ **generateHash**(): `string`

Generate a hash of the text node.
The ID is not part of the hash as it can change independent of content.

#### Returns

`string`

#### Inherited from

[ImageNode](ImageNode.md).[generateHash](ImageNode.md#generatehash)

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

#### Inherited from

[ImageNode](ImageNode.md).[getContent](ImageNode.md#getcontent)

#### Defined in

[packages/core/src/Node.ts:192](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L192)

---

### getEmbedding

▸ **getEmbedding**(): `number`[]

#### Returns

`number`[]

#### Inherited from

[ImageNode](ImageNode.md).[getEmbedding](ImageNode.md#getembedding)

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

#### Inherited from

[ImageNode](ImageNode.md).[getMetadataStr](ImageNode.md#getmetadatastr)

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

#### Inherited from

[ImageNode](ImageNode.md).[getNodeInfo](ImageNode.md#getnodeinfo)

#### Defined in

[packages/core/src/Node.ts:224](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L224)

---

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Inherited from

[ImageNode](ImageNode.md).[getText](ImageNode.md#gettext)

#### Defined in

[packages/core/src/Node.ts:228](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L228)

---

### getType

▸ **getType**(): [`ObjectType`](../enums/ObjectType.md)

#### Returns

[`ObjectType`](../enums/ObjectType.md)

#### Overrides

[ImageNode](ImageNode.md).[getType](ImageNode.md#gettype)

#### Defined in

[packages/core/src/Node.ts:318](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L318)

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

[ImageNode](ImageNode.md).[setContent](ImageNode.md#setcontent)

#### Defined in

[packages/core/src/Node.ts:218](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L218)

---

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

Used with built in JSON.stringify

#### Returns

`Record`<`string`, `any`\>

#### Inherited from

[ImageNode](ImageNode.md).[toJSON](ImageNode.md#tojson)

#### Defined in

[packages/core/src/Node.ts:146](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Node.ts#L146)
