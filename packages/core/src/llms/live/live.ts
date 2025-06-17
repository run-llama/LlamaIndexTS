import type {
  AudioConfig,
  ChatMessage,
  LiveConnectConfig,
  MessageContentAudioDetail,
  MessageContentDetail,
  MessageContentImageDataDetail,
  MessageContentVideoDetail,
} from "../type";
import type { LiveEvent } from "./live-types";
import type { MessageSender } from "./sender";

export enum LiveLLMCapability {
  EPHEMERAL_KEY = "ephemeral_key",
  AUDIO_CONFIG = "audio_config",
}

export abstract class LiveLLMSession {
  protected eventQueue: LiveEvent[] = [];
  protected eventResolvers: ((value: LiveEvent) => void)[] = [];
  closed = false;
  audioStream: MediaStream | undefined;
  peerConnection: RTCPeerConnection | undefined;
  dataChannel: RTCDataChannel | undefined;
  abstract get messageSender(): MessageSender;

  private isTextMessage(content: MessageContentDetail) {
    return content.type === "text";
  }

  private isAudioMessage(
    content: MessageContentDetail,
  ): content is MessageContentAudioDetail {
    return content.type === "audio";
  }

  private isImageMessage(
    content: MessageContentDetail,
  ): content is MessageContentImageDataDetail {
    return content.type === "image";
  }

  private isVideoMessage(
    content: MessageContentDetail,
  ): content is MessageContentVideoDetail {
    return content.type === "video";
  }

  setupAudioTracks(config?: AudioConfig) {
    if (!this.peerConnection) return;

    this.peerConnection.ontrack = (event) => {
      if (config?.onTrack) {
        config.onTrack(event.streams[0] || null);
      }
    };

    if (config?.stream) {
      this.audioStream = config.stream;
      this.audioStream.getAudioTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.audioStream!);
      });
    }
  }

  sendMessage(message: ChatMessage) {
    const { content, role } = message;
    if (!Array.isArray(content)) {
      this.messageSender.sendTextMessage(content, role);
    } else {
      for (const item of content) {
        this.processMessage(item, role);
      }
    }
  }

  private processMessage(message: MessageContentDetail, role?: string) {
    if (this.isTextMessage(message)) {
      this.messageSender.sendTextMessage(message.text, role);
    } else if (
      this.isAudioMessage(message) &&
      this.messageSender.sendAudioMessage
    ) {
      this.messageSender.sendAudioMessage(message, role);
    } else if (
      this.isImageMessage(message) &&
      this.messageSender.sendImageMessage
    ) {
      this.messageSender.sendImageMessage(message, role);
    } else if (
      this.isVideoMessage(message) &&
      this.messageSender.sendVideoMessage
    ) {
      this.messageSender.sendVideoMessage(message, role);
    }
  }

  async *streamEvents(): AsyncIterable<LiveEvent> {
    while (true) {
      const event = await this.nextEvent();
      if (event === undefined) {
        break;
      }
      yield event;
    }
  }
  abstract disconnect(): Promise<void>;

  protected async nextEvent(): Promise<LiveEvent | undefined> {
    if (this.eventQueue.length) {
      return Promise.resolve(this.eventQueue.shift());
    }

    return new Promise((resolve) => {
      this.eventResolvers.push(resolve);
    });
  }

  //Uses an async queue to send events to the client
  // if the consumer is waiting for an event, it will be resolved immediately
  // otherwise, the event will be queued up and sent when the consumer is ready
  pushEventToQueue(event: LiveEvent) {
    if (this.eventResolvers.length) {
      //resolving the promise with the event
      this.eventResolvers.shift()!(event);
    } else {
      this.eventQueue.push(event);
    }
  }
}

export abstract class LiveLLM {
  /**
   * Set of capabilities supported by this implementation.
   * Override in subclasses as needed.
   */
  capabilities: Set<LiveLLMCapability> = new Set();

  abstract connect(config?: LiveConnectConfig): Promise<LiveLLMSession>;
  abstract getEphemeralKey(): Promise<string | undefined>;

  hasCapability(capability: LiveLLMCapability): boolean {
    return this.capabilities.has(capability);
  }
}
