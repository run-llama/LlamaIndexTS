import type {
  MessageContentAudioDetail,
  MessageContentImageDataDetail,
  MessageContentVideoDetail,
} from "../type";

export interface MessageSender {
  sendTextMessage(message: string, role?: string): void;
  sendAudioMessage?(content: MessageContentAudioDetail, role?: string): void;
  sendImageMessage?(
    content: MessageContentImageDataDetail,
    role?: string,
  ): void;
  sendVideoMessage?(content: MessageContentVideoDetail, role?: string): void;
}
