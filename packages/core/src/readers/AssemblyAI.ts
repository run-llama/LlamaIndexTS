import {
  AssemblyAI,
  BaseServiceParams,
  CreateTranscriptParameters,
  SubtitleFormat,
  TranscriptParagraph,
  TranscriptSentence,
} from "assemblyai";
import { Document } from "../Node";
import { BaseReader } from "./base";

type AssemblyAIOptions = Partial<BaseServiceParams>;

/**
 * Base class for AssemblyAI Readers.
 */
abstract class AssemblyAIReader implements BaseReader {
  protected client: AssemblyAI;

  /**
   * Creates a new AssemblyAI Reader.
   * @param assemblyAIOptions The options to configure the AssemblyAI Reader.
   * Configure the `assemblyAIOptions.apiKey` with your AssemblyAI API key, or configure it as the `ASSEMBLYAI_API_KEY` environment variable.
   */
  constructor(assemblyAIOptions?: AssemblyAIOptions) {
    let options = assemblyAIOptions;
    if (!options) {
      options = {};
    }
    if (!options.apiKey) {
      options.apiKey = process.env.ASSEMBLYAI_API_KEY;
    }
    if (!options.apiKey) {
      throw new Error("No AssemblyAI API key provided. Pass an `apiKey` option, or configure the `ASSEMBLYAI_API_KEY` environment variable.");
    }

    this.client = new AssemblyAI(options as BaseServiceParams);
  }

  abstract loadData(...args: any[]): Promise<Document[]>;

  protected async getOrCreateTranscript(params: CreateTranscriptParameters | string) {
    if (typeof params === "string") {
      return await this.client.transcripts.get(params);
    }
    else {
      return await this.client.transcripts.create(params);
    }
  }

  protected async getTranscriptId(params: CreateTranscriptParameters | string) {
    if (typeof params === "string") {
      return params;
    }
    else {
      return (await this.client.transcripts.create(params)).id;
    }
  }
}

/**
 * Creates and reads the transcript as a document using AssemblyAI.
 */
class AudioTranscriptReader extends AssemblyAIReader {
  /**
   * Creates or gets a transcript and loads the transcript as a document using AssemblyAI.
   * @param params The parameters to create or get the transcript.
   * @returns A promise that resolves to a single document containing the transcript text.
   */
  async loadData(params: CreateTranscriptParameters | string): Promise<Document[]> {
    const transcript = await this.getOrCreateTranscript(params);
    return [
      new Document({ text: transcript.text || undefined }),
    ];
  }
}

/**
 * Creates a transcript and returns a document for each paragraph.
 */
class AudioTranscriptParagraphsReader extends AssemblyAIReader {
  /**
   * Creates or gets a transcript, and returns a document for each paragraph.
   * @param params The parameters to create or get the transcript.
   * @returns A promise that resolves to an array of documents, each containing a paragraph of the transcript.
   */
  async loadData(params: CreateTranscriptParameters | string): Promise<Document[]> {
    let transcriptId = await this.getTranscriptId(params);
    const paragraphsResponse = await this.client.transcripts.paragraphs(
      transcriptId
    );
    return paragraphsResponse.paragraphs.map((p: TranscriptParagraph) =>
      new Document({ text: p.text }),
    );
  }
}

/**
 * Creates a transcript and returns a document for each sentence.
 */
class AudioTranscriptSentencesReader extends AssemblyAIReader {
  /**
   * Creates or gets a transcript, and returns a document for each sentence.
   * @param params The parameters to create or get the transcript.
   * @returns A promise that resolves to an array of documents, each containing a sentence of the transcript.
   */
  async loadData(params: CreateTranscriptParameters | string): Promise<Document[]> {
    let transcriptId = await this.getTranscriptId(params);
    const sentencesResponse = await this.client.transcripts.sentences(
      transcriptId
    );
    return sentencesResponse.sentences.map((p: TranscriptSentence) =>
      new Document({ text: p.text }),
    );
  }
}

/**
 * Creates a transcript and reads subtitles for the transcript as `srt` or `vtt` format.
 */
class AudioSubtitlesReader extends AssemblyAIReader {
  /**
   * Creates or gets a transcript and reads subtitles for the transcript as `srt` or `vtt` format.
   * @param params The parameters to create or get the transcript.
   * @param subtitleFormat The format of the subtitles, either `srt` or `vtt`.
   * @returns A promise that resolves a document containing the subtitles as the page content.
   */
  async loadData(
    params: CreateTranscriptParameters | string,
    subtitleFormat: SubtitleFormat = 'srt'
  ): Promise<Document[]> {
    let transcriptId = await this.getTranscriptId(params);
    const subtitles = await this.client.transcripts.subtitles(transcriptId, subtitleFormat);
    return [new Document({ text: subtitles })];
  }
}

export {
  AudioTranscriptReader,
  AudioTranscriptParagraphsReader,
  AudioTranscriptSentencesReader,
  AudioSubtitlesReader,
}
export type {
  AssemblyAIOptions,
  CreateTranscriptParameters,
  SubtitleFormat
}
