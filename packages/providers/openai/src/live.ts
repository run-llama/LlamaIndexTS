import { LiveLLM, type LiveConnectConfig } from "@llamaindex/core/llms";
import { getEnv } from "@llamaindex/env";
import type { ChatModel } from "openai/resources.mjs";
import { OpenAILiveSession } from "./live-session";
import { OpenAI } from "./llm";
import {
  mapModalityToOpenAIModality,
  type OpenAILiveConfig,
  type OpenAIVoiceNames,
} from "./utils";

export class OpenAILive extends LiveLLM {
  private apiKey: string | undefined;
  private model: ChatModel | (string & {});
  voiceName?: OpenAIVoiceNames | undefined;
  private baseURL: string;

  constructor(init?: OpenAILiveConfig) {
    super();
    this.apiKey = init?.apiKey ?? getEnv("OPENAI_API_KEY");
    this.model = init?.model ?? "gpt-4o-realtime-preview-2025-06-03";
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

  private async getSDPResponse(offer: RTCSessionDescriptionInit) {
    const EPHEMERAL_KEY = await this.getEPHEMERALKey();

    const sdpResponse = await fetch(`${this.baseURL}?model=${this.model}`, {
      method: "POST",
      body: offer.sdp!,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    return sdpResponse;
  }

  private async establishSDPConnection(session: OpenAILiveSession) {
    const offer = await session.peerConnection!.createOffer();
    await session.peerConnection!.setLocalDescription(offer);

    if (!offer.sdp) {
      throw new Error("Failed to create SDP offer");
    }

    const sdpResponse = await this.getSDPResponse(offer);

    const answer = {
      sdp: await sdpResponse.text(),
      type: "answer" as RTCSdpType,
    };

    await session.peerConnection!.setRemoteDescription(answer);
  }

  private async initializeRTCPeerConnectionAndDataChannel(
    session: OpenAILiveSession,
  ) {
    session.peerConnection = new RTCPeerConnection();
    await this.setupAudioStream(session);
    session.dataChannel =
      session.peerConnection.createDataChannel("oai-events");
  }

  private async setupWebRTC(session: OpenAILiveSession) {
    await this.initializeRTCPeerConnectionAndDataChannel(session);
    await this.establishSDPConnection(session);
  }

  private async setupAudioStream(session: OpenAILiveSession) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getAudioTracks().forEach((track) => {
      session.peerConnection?.addTrack(track, stream);
    });

    session.peerConnection!.ontrack = (event) => {
      const audioEl = document.querySelector("audio");
      if (audioEl) {
        audioEl.autoplay = true;
        audioEl.srcObject = event.streams[0] || null;
      }
    };
  }

  async connect(config?: LiveConnectConfig): Promise<OpenAILiveSession> {
    const session = new OpenAILiveSession();
    await this.setupWebRTC(session);
    this.setupEventListeners(session, config);
    return session;
  }

  private setupEventListeners(
    session: OpenAILiveSession,
    config?: LiveConnectConfig,
  ) {
    this.messageEventListener(session, config);
    this.openEventListener(session, config);
    this.errorEventListener(session);
  }

  private messageEventListener(
    session: OpenAILiveSession,
    config?: LiveConnectConfig,
  ) {
    session.dataChannel?.addEventListener("message", (event) => {
      //TODO: Log events to the user
      session.handleEvents(JSON.parse(event.data), config?.tools ?? []);
    });
  }

  private openEventListener(
    session: OpenAILiveSession,
    config?: LiveConnectConfig,
  ) {
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
      session.pushEventToQueue({ type: "open" });
    });
  }

  private errorEventListener(session: OpenAILiveSession) {
    session.dataChannel?.addEventListener("error", (event) => {
      session.pushEventToQueue({
        type: "error",
        error: event,
      });
    });
  }
}
