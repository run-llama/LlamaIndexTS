---
id: "DefaultContextGenerator"
title: "Class: DefaultContextGenerator"
sidebar_label: "DefaultContextGenerator"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- [`ContextGenerator`](../interfaces/ContextGenerator.md)

## Constructors

### constructor

• **new DefaultContextGenerator**(`init`)

#### Parameters

| Name                        | Type                                                                |
| :-------------------------- | :------------------------------------------------------------------ |
| `init`                      | `Object`                                                            |
| `init.contextSystemPrompt?` | (`__namedParameters`: `Object`) => `string`                         |
| `init.nodePostprocessors?`  | [`BaseNodePostprocessor`](../interfaces/BaseNodePostprocessor.md)[] |
| `init.retriever`            | [`BaseRetriever`](../interfaces/BaseRetriever.md)                   |

#### Defined in

[packages/core/src/ChatEngine.ts:188](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L188)

## Properties

### contextSystemPrompt

• **contextSystemPrompt**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Defined in

[packages/core/src/ChatEngine.ts:185](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L185)

---

### nodePostprocessors

• **nodePostprocessors**: [`BaseNodePostprocessor`](../interfaces/BaseNodePostprocessor.md)[]

#### Defined in

[packages/core/src/ChatEngine.ts:186](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L186)

---

### retriever

• **retriever**: [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[packages/core/src/ChatEngine.ts:184](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L184)

## Methods

### applyNodePostprocessors

▸ `Private` **applyNodePostprocessors**(`nodes`): [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Parameters

| Name    | Type                                                                             |
| :------ | :------------------------------------------------------------------------------- |
| `nodes` | [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Defined in

[packages/core/src/ChatEngine.ts:199](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L199)

---

### generate

▸ **generate**(`message`, `parentEvent?`): `Promise`<[`Context`](../interfaces/Context.md)\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `message`      | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`Context`](../interfaces/Context.md)\>

#### Implementation of

[ContextGenerator](../interfaces/ContextGenerator.md).[generate](../interfaces/ContextGenerator.md#generate)

#### Defined in

[packages/core/src/ChatEngine.ts:206](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L206)
