---
id: "AudioTranscriptReader"
title: "Class: AudioTranscriptReader"
sidebar_label: "AudioTranscriptReader"
sidebar_position: 0
custom_edit_url: null
---

Transcribe audio and read the transcript as a document using AssemblyAI.

## Hierarchy

- `AssemblyAIReader`

  ↳ **`AudioTranscriptReader`**

## Constructors

### constructor

• **new AudioTranscriptReader**(`assemblyAIOptions?`)

Creates a new AssemblyAI Reader.

#### Parameters

| Name                 | Type                            | Description                                                                                                                                                                              |
| :------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assemblyAIOptions?` | `Partial`<`BaseServiceParams`\> | The options to configure the AssemblyAI Reader. Configure the `assemblyAIOptions.apiKey` with your AssemblyAI API key, or configure it as the `ASSEMBLYAI_API_KEY` environment variable. |

#### Inherited from

AssemblyAIReader.constructor

#### Defined in

[packages/core/src/readers/AssemblyAI.ts:25](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/AssemblyAI.ts#L25)

## Properties

### client

• `Protected` **client**: `AssemblyAI`

#### Inherited from

AssemblyAIReader.client

#### Defined in

[packages/core/src/readers/AssemblyAI.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/AssemblyAI.ts#L18)

## Methods

### getTranscriptId

▸ `Protected` **getTranscriptId**(`params`): `Promise`<`string`\>

#### Parameters

| Name     | Type                                                   |
| :------- | :----------------------------------------------------- |
| `params` | `string` \| [`TranscribeParams`](../#transcribeparams) |

#### Returns

`Promise`<`string`\>

#### Inherited from

AssemblyAIReader.getTranscriptId

#### Defined in

[packages/core/src/readers/AssemblyAI.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/AssemblyAI.ts#L52)

---

### loadData

▸ **loadData**(`params`): `Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

Transcribe audio or get a transcript and load the transcript as a document using AssemblyAI.

#### Parameters

| Name     | Type                                                   | Description                                                           |
| :------- | :----------------------------------------------------- | :-------------------------------------------------------------------- |
| `params` | `string` \| [`TranscribeParams`](../#transcribeparams) | Parameters to transcribe an audio file or get an existing transcript. |

#### Returns

`Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

A promise that resolves to a single document containing the transcript text.

#### Overrides

AssemblyAIReader.loadData

#### Defined in

[packages/core/src/readers/AssemblyAI.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/AssemblyAI.ts#L70)

---

### transcribeOrGetTranscript

▸ `Protected` **transcribeOrGetTranscript**(`params`): `Promise`<`Transcript`\>

#### Parameters

| Name     | Type                                                   |
| :------- | :----------------------------------------------------- |
| `params` | `string` \| [`TranscribeParams`](../#transcribeparams) |

#### Returns

`Promise`<`Transcript`\>

#### Inherited from

AssemblyAIReader.transcribeOrGetTranscript

#### Defined in

[packages/core/src/readers/AssemblyAI.ts:44](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/AssemblyAI.ts#L44)
