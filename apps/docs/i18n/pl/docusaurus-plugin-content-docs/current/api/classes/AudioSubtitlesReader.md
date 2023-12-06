---
id: "AudioSubtitlesReader"
title: "Class: AudioSubtitlesReader"
sidebar_label: "AudioSubtitlesReader"
sidebar_position: 0
custom_edit_url: null
---

Transcribe audio a transcript and read subtitles for the transcript as `srt` or `vtt` format.

## Hierarchy

- `AssemblyAIReader`

  ↳ **`AudioSubtitlesReader`**

## Constructors

### constructor

• **new AudioSubtitlesReader**(`assemblyAIOptions?`)

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

▸ **loadData**(`params`, `subtitleFormat?`): `Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

Transcribe audio or get a transcript and reads subtitles for the transcript as `srt` or `vtt` format.

#### Parameters

| Name             | Type                                                   | Default value | Description                                                       |
| :--------------- | :----------------------------------------------------- | :------------ | :---------------------------------------------------------------- |
| `params`         | `string` \| [`TranscribeParams`](../#transcribeparams) | `undefined`   | The parameters to transcribe audio or get an existing transcript. |
| `subtitleFormat` | [`SubtitleFormat`](../#subtitleformat)                 | `"srt"`       | The format of the subtitles, either `srt` or `vtt`.               |

#### Returns

`Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

A promise that resolves a document containing the subtitles as the page content.

#### Overrides

AssemblyAIReader.loadData

#### Defined in

[packages/core/src/readers/AssemblyAI.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/AssemblyAI.ts#L124)

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
