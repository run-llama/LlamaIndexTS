import { LiveLLM, type LiveConnectConfig } from "@llamaindex/core/llms";
import { getEnv } from "@llamaindex/env";
import type { ChatModel } from "openai/resources.mjs";
import { OpenAILiveSession } from "./live-session";
import { OpenAI } from "./llm";
import { mapModalityToOpenAIModality, type OpenAILiveConfig } from "./utils";

export class OpenAILive extends LiveLLM {
  private apiKey: string | undefined;
  private model: ChatModel | undefined;
  voiceName?: string | undefined;
  private baseURL: string;

  constructor(init?: OpenAILiveConfig) {
    super();
    this.apiKey = init?.apiKey ?? getEnv("OPENAI_API_KEY");
    this.model = init?.model;
    this.voiceName = init?.voiceName;
    this.baseURL = "https://api.openai.com/v1/realtime";
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
  }

  private async getEPHEMERALKey() {
    const response = await fetch(`${this.baseURL}/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        voice: "alloy",
      }),
    });

    const data = await response.json();
    return data.client_secret.value;
  }

  async connect(config?: LiveConnectConfig): Promise<OpenAILiveSession> {
    const session = new OpenAILiveSession();

    const peerConnection = new RTCPeerConnection();
    session.setPeerConnection(peerConnection);

    const dataChannel = peerConnection.createDataChannel("oai-events");
    session.setDataChannel(dataChannel);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    if (!offer.sdp) {
      throw new Error("Failed to create SDP offer");
    }

    const EPHEMERAL_KEY = await this.getEPHEMERALKey();

    const sdpResponse = await fetch(`${this.baseURL}?model=${this.model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      sdp: await sdpResponse.text(),
      type: "answer" as RTCSdpType,
    };

    await peerConnection.setRemoteDescription(answer);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getAudioTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    session.dataChannel?.addEventListener("message", session.handleEvents);

    session.dataChannel?.addEventListener("open", () => {
      const event = {
        type: "session.update",
        session: {
          voice: this.voiceName,
          instructions: config?.systemInstruction,
          tools: config?.tools?.map(OpenAI.toTool),
          modalities: config?.responseModality?.map(
            mapModalityToOpenAIModality,
          ),
        },
      };

      session.dataChannel?.send(JSON.stringify(event));
    });

    session.dataChannel?.addEventListener("error", (event) => {
      session.pushEventToQueue({
        type: "error",
        error: event,
      });
    });

    return session;
  }
}
