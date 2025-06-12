import type {
  MessageContentAudioDetail,
  MessageContentImageDataDetail,
  MessageContentVideoDetail,
} from "../type";
import type { LiveLLMSession } from "./live";

export interface MessageSenderFactory {
  createMessageSender(session: LiveLLMSession): MessageSender;
}

export interface MessageSender {
  sendTextMessage(message: string, role?: string): void;
  sendAudioMessage?(content: MessageContentAudioDetail, role?: string): void;
  sendImageMessage?(
    content: MessageContentImageDataDetail,
    role?: string,
  ): void;
  sendVideoMessage?(content: MessageContentVideoDetail, role?: string): void;
}
