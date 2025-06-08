import type {
  MessageContentAudioDetail,
  MessageContentDetail,
  MessageContentImageDataDetail,
  MessageContentVideoDetail,
} from "../type";
import type { MessageSender } from "./sender";

export abstract class MessageHandler {
  constructor(protected messageSender: MessageSender) {}

  abstract canHandleMessage(content: MessageContentDetail): boolean;
  abstract handleMessage(content: string | MessageContentDetail): void;
}

export class TextMessageHandler extends MessageHandler {
  canHandleMessage(content: MessageContentDetail): boolean {
    return content.type === "text";
  }

  handleMessage(content: string): void {
    this.messageSender.sendTextMessage(content);
  }
}

export class AudioMessageHandler extends MessageHandler {
  canHandleMessage(content: MessageContentDetail): boolean {
    return content.type === "audio";
  }

  handleMessage(content: MessageContentAudioDetail): void {
    if (!this.messageSender.sendAudioMessage) {
      throw new Error("sendAudioMessage is not implemented");
    }
    this.messageSender.sendAudioMessage(content);
  }
}

export class ImageMessageHandler extends MessageHandler {
  canHandleMessage(content: MessageContentDetail): boolean {
    return content.type === "image";
  }

  handleMessage(content: MessageContentImageDataDetail): void {
    if (!this.messageSender.sendImageMessage) {
      throw new Error("sendImageMessage is not implemented");
    }
    this.messageSender.sendImageMessage(content);
  }
}

export class VideoMessageHandler extends MessageHandler {
  canHandleMessage(content: MessageContentDetail): boolean {
    return content.type === "video";
  }

  handleMessage(content: MessageContentVideoDetail): void {
    if (!this.messageSender.sendVideoMessage) {
      throw new Error("sendVideoMessage is not implemented");
    }
    this.messageSender.sendVideoMessage(content);
  }
}

export class MessageHandlerFactory {
  static createMessageHandler(messageSender: MessageSender): MessageHandler[] {
    const handlers: MessageHandler[] = [new TextMessageHandler(messageSender)];

    if (messageSender.sendAudioMessage) {
      handlers.push(new AudioMessageHandler(messageSender));
    }
    if (messageSender.sendImageMessage) {
      handlers.push(new ImageMessageHandler(messageSender));
    }
    if (messageSender.sendVideoMessage) {
      handlers.push(new VideoMessageHandler(messageSender));
    }
    return handlers;
  }
}
