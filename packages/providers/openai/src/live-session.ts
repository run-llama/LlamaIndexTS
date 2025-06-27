import type {
  AudioConfig,
  BaseTool,
  MessageSender,
} from "@llamaindex/core/llms";

import { LiveLLMSession } from "@llamaindex/core/llms";
import { OpenAIMessageSender } from "./message-sender";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServerEvent = Record<string, any>;
export interface FunctionCall {
  name: string;
  call_id: string;
  args: Record<string, unknown>;
}

export class OpenAILiveSession extends LiveLLMSession {
  closed = false;
  audioStream: MediaStream | undefined;
  peerConnection: RTCPeerConnection | undefined;
  dataChannel: RTCDataChannel | undefined;

  get messageSender(): MessageSender {
    return new OpenAIMessageSender(this);
  }

  private isResponseDoneEvent(event: ServerEvent) {
    return event.type === "response.done";
  }

  private isTextEvent(event: ServerEvent) {
    return (
      event.response.output &&
      event.response?.output[0]?.type === "message" &&
      event.response?.output[0]?.content[0]?.type === "text"
    );
  }

  private isFunctionCallEvent(event: ServerEvent) {
    return (
      event.response.output &&
      event.response?.output[0]?.type === "function_call"
    );
  }

  private isAudioDeltaEvent(event: ServerEvent) {
    return event.type === "response.audio.delta";
  }

  private isInterruptedEvent(event: ServerEvent) {
    return event.type === "output_audio_buffer.cleared";
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

  async handleEvents(event: ServerEvent, toolCalls: BaseTool[]) {
    if (this.isAudioDeltaEvent(event)) {
      this.pushEventToQueue({
        type: "audio",
        data: event.delta,
        mimeType: "audio/wav",
      });
    }
    if (this.isResponseDoneEvent(event)) {
      if (this.isTextEvent(event)) {
        this.pushEventToQueue({
          type: "text",
          text: event.response?.output[0]?.content[0]?.text,
        });
      }
      if (this.isFunctionCallEvent(event)) {
        await this.handleFunctionCall(event, toolCalls);
      }
      if (this.isInterruptedEvent(event)) {
        this.pushEventToQueue({
          type: "interrupted",
        });
      }
    }
  }

  private async sendToolCallResponses(
    eventToolCalls: FunctionCall[],
    toolCalls: BaseTool[],
  ) {
    for (const toolCall of eventToolCalls) {
      const tool = toolCalls.find((t) => t.metadata.name === toolCall.name);
      if (tool && tool.call) {
        const response = await tool.call(toolCall.args);
        this.sendToolCallResponse(toolCall.call_id, response);
      }
    }
  }

  async sendResponseCreateEvent() {
    this.dataChannel?.send(
      JSON.stringify({
        type: "response.create",
      }),
    );
  }

  private sendToolCallResponse(callId: string, response: unknown) {
    if (!this.dataChannel) {
      throw new Error("Data channel not connected");
    }
    const event = {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: JSON.stringify(response),
      },
    };

    this.dataChannel.send(JSON.stringify(event));
    this.sendResponseCreateEvent();
  }

  private async handleFunctionCall(event: ServerEvent, toolCalls: BaseTool[]) {
    const eventToolCalls: FunctionCall[] = event.response.output.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (output: Record<string, any>) => {
        return {
          name: output.name,
          call_id: output.call_id,
          args:
            typeof output.arguments === "string"
              ? JSON.parse(output.arguments)
              : output.arguments,
        };
      },
    );

    if (eventToolCalls && eventToolCalls.length > 0) {
      await this.sendToolCallResponses(eventToolCalls, toolCalls);
    }
  }

  async disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = undefined;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = undefined;
    }
    this.closed = true;

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.audioStream = undefined;
    }
  }

  setPeerConnection(pc: RTCPeerConnection) {
    this.peerConnection = pc;
  }

  setDataChannel(dc: RTCDataChannel) {
    this.dataChannel = dc;
  }
}
