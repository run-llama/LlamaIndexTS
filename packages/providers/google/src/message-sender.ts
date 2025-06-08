import type {
  MessageContentAudioDetail,
  MessageContentImageDataDetail,
  MessageContentVideoDetail,
  MessageSender,
  MessageSenderFactory,
} from "@llamaindex/core/llms";
import type { GeminiLiveSession } from "./live";

export class GeminiMessageSender implements MessageSender {
  private geminiSession: GeminiLiveSession;

  constructor(session: GeminiLiveSession) {
    this.geminiSession = session;
  }

  sendTextMessage(message: string, role?: string) {
    this.geminiSession.session?.sendClientContent({
      turns: [
        {
          parts: [{ text: message }],
          ...(role ? { role } : {}),
        },
      ],
    });
  }

  sendAudioMessage(content: MessageContentAudioDetail, role?: string) {
    this.geminiSession.session?.sendRealtimeInput({
      audio: {
        data: content.data,
        mimeType: content.mimeType,
      },
    });
  }

  sendImageMessage(content: MessageContentImageDataDetail, role?: string) {
    this.geminiSession.session?.sendRealtimeInput({
      media: {
        data: content.data,
        mimeType: content.mimeType,
      },
    });
  }

  sendVideoMessage(content: MessageContentVideoDetail, role?: string) {
    this.geminiSession.session?.sendRealtimeInput({
      video: {
        data: content.data,
        mimeType: content.mimeType,
      },
    });
  }
}

export class GemniniMessageSenderFactory implements MessageSenderFactory {
  createMessageSender(session: GeminiLiveSession): MessageSender {
    return new GeminiMessageSender(session);
  }
}
