import type { BaseTool, ChatMessage } from "@llamaindex/core/llms";

import { LiveLLMSession } from "@llamaindex/core/llms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServerEvent = Record<string, any>;
export interface FunctionCall {
  name: string;
  call_id: string;
  args: Record<string, unknown>;
}

export class OpenAILiveSession extends LiveLLMSession {
  private peerConnection: RTCPeerConnection | undefined;
  dataChannel: RTCDataChannel | undefined;
  closed = false;

  constructor() {
    super();
  }

  private isResponseDoneEvent(event: ServerEvent) {
    return event.type === "response.done";
  }

  private isTextEvent(event: ServerEvent) {
    return event.response.output && event.response.output.type === "message";
  }

  private isAudioEvent(event: ServerEvent) {
    return event.type === "audio";
  }

  private isFunctionCallEvent(event: ServerEvent) {
    return (
      event.response.output && event.response.output.type === "function_call"
    );
  }

  private isInterruptedEvent(event: ServerEvent) {
    return event.type === "output_audio_buffer.cleared";
  }

  async handleEvents(event: ServerEvent, toolCalls: BaseTool[]) {
    if (this.isResponseDoneEvent(event)) {
      if (this.isTextEvent(event)) {
        this.pushEventToQueue({
          type: "text",
          text: event.response.output.message.content,
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

  private async sendResponseCreateEvent() {
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
    this.dataChannel.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          tool_call_id: callId,
          output: response,
        },
      }),
    );

    this.sendResponseCreateEvent();
  }

  private async handleFunctionCall(event: ServerEvent, toolCalls: BaseTool[]) {
    const eventToolCalls: FunctionCall[] = event.response.output.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (output: Record<string, any>) => {
        return {
          name: output.name,
          call_id: output.id,
          args: output.args,
        };
      },
    );

    if (eventToolCalls && eventToolCalls.length > 0) {
      await this.sendToolCallResponses(eventToolCalls, toolCalls);
    }
  }

  sendMessage(message: ChatMessage) {
    if (!this.dataChannel) {
      throw new Error("Data channel not connected");
    }
    this.handleUserInput(message);
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
  }

  setPeerConnection(pc: RTCPeerConnection) {
    this.peerConnection = pc;
  }

  setDataChannel(dc: RTCDataChannel) {
    this.dataChannel = dc;
  }
}
