---
id: "KeywordTableRAKERetriever"
title: "Class: KeywordTableRAKERetriever"
sidebar_label: "KeywordTableRAKERetriever"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `BaseKeywordTableRetriever`

  ↳ **`KeywordTableRAKERetriever`**

## Constructors

### constructor

• **new KeywordTableRAKERetriever**(`«destructured»`)

#### Parameters

| Name                             | Type                                        |
| :------------------------------- | :------------------------------------------ |
| `«destructured»`                 | `Object`                                    |
| › `index`                        | [`KeywordTableIndex`](KeywordTableIndex.md) |
| › `keywordExtractTemplate?`      | (`__namedParameters`: `Object`) => `string` |
| › `maxKeywordsPerQuery`          | `number`                                    |
| › `numChunksPerQuery`            | `number`                                    |
| › `queryKeywordExtractTemplate?` | (`__namedParameters`: `Object`) => `string` |

#### Inherited from

BaseKeywordTableRetriever.constructor

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L31)

## Properties

### docstore

• `Protected` **docstore**: [`BaseDocumentStore`](BaseDocumentStore.md)

#### Inherited from

BaseKeywordTableRetriever.docstore

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:23](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L23)

---

### index

• `Protected` **index**: [`KeywordTableIndex`](KeywordTableIndex.md)

#### Inherited from

BaseKeywordTableRetriever.index

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L21)

---

### indexStruct

• `Protected` **indexStruct**: [`KeywordTable`](KeywordTable.md)

#### Inherited from

BaseKeywordTableRetriever.indexStruct

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L22)

---

### keywordExtractTemplate

• `Protected` **keywordExtractTemplate**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Inherited from

BaseKeywordTableRetriever.keywordExtractTemplate

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:28](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L28)

---

### maxKeywordsPerQuery

• `Protected` **maxKeywordsPerQuery**: `number`

#### Inherited from

BaseKeywordTableRetriever.maxKeywordsPerQuery

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L26)

---

### numChunksPerQuery

• `Protected` **numChunksPerQuery**: `number`

#### Inherited from

BaseKeywordTableRetriever.numChunksPerQuery

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L27)

---

### queryKeywordExtractTemplate

• `Protected` **queryKeywordExtractTemplate**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Inherited from

BaseKeywordTableRetriever.queryKeywordExtractTemplate

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L29)

---

### serviceContext

• `Protected` **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

BaseKeywordTableRetriever.serviceContext

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:24](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L24)

## Methods

### getKeywords

▸ **getKeywords**(`query`): `Promise`<`string`[]\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `query` | `string` |

#### Returns

`Promise`<`string`[]\>

#### Overrides

BaseKeywordTableRetriever.getKeywords

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:114](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L114)

---

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

BaseKeywordTableRetriever.getServiceContext

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:81](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L81)

---

### retrieve

▸ **retrieve**(`query`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `query` | `string` |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Inherited from

BaseKeywordTableRetriever.retrieve

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts:59](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/keyword/KeywordTableIndexRetriever.ts#L59)
