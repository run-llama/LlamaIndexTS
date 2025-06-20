import {
  type MessageContentAudioDetail,
  type MessageSender,
} from "@llamaindex/core/llms";
import type { OpenAILiveSession } from "./live-session";

export class OpenAIMessageSender implements MessageSender {
  private openaiSession: OpenAILiveSession;

  constructor(session: OpenAILiveSession) {
    this.openaiSession = session;
  }

  sendTextMessage(message: string, role?: string) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    this.openaiSession.dataChannel?.send(JSON.stringify(event));
    this.openaiSession.sendResponseCreateEvent();
  }

  sendAudioMessage(content: MessageContentAudioDetail, role?: string) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_audio",
            audio: content.data,
          },
        ],
      },
    };

    this.openaiSession.dataChannel?.send(JSON.stringify(event));
    this.openaiSession.sendResponseCreateEvent();
  }
}
