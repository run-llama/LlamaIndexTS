import {
  LiveLLM,
  LiveLLMCapability,
  type LiveConnectConfig,
} from "@llamaindex/core/llms";
import type { ChatModel } from "openai/resources.mjs";
import { OpenAILiveSession } from "./live-session";
import {
  mapModalityToOpenAIModality,
  toOpenAILiveTool,
  type OpenAILiveConfig,
  type OpenAIVoiceNames,
} from "./utils";

const REALTIME_MODELS = [
  "gpt-4o-realtime-preview-2025-06-03",
  "gpt-4o-realtime-preview-2024-12-17",
  "gpt-4o-realtime-preview-2024-10-01",
];
export class OpenAILive extends LiveLLM {
  private apiKey: string | undefined;
  private model: ChatModel | (string & {});
  voiceName?: OpenAIVoiceNames | undefined;
  private baseURL: string;

  constructor(init?: OpenAILiveConfig) {
    super();
    this.apiKey = init?.apiKey;
    this.model = init?.model ?? "gpt-4o-realtime-preview-2025-06-03";
    this.voiceName = init?.voiceName;
    this.baseURL = "https://api.openai.com/v1/realtime";
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    this.capabilities.add(LiveLLMCapability.EPHEMERAL_KEY);
    this.capabilities.add(LiveLLMCapability.AUDIO_CONFIG);
  }

  async getEphemeralKey() {
    if (!REALTIME_MODELS.includes(this.model)) {
      throw new Error(
        "Ephemeral key is only supported for gpt-4o-realtime-preview models",
      );
    }
    const response = await fetch(`${this.baseURL}/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        voice: this.voiceName,
      }),
    });

    const data = await response.json();
    return data.client_secret.value;
  }

  private async getSDPResponse(offer: RTCSessionDescriptionInit) {
    const sdpResponse = await fetch(`${this.baseURL}?model=${this.model}`, {
      method: "POST",
      body: offer.sdp!,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
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
    config?: LiveConnectConfig,
  ) {
    session.peerConnection = new RTCPeerConnection();
    session.setupAudioTracks(config?.audioConfig);
    session.dataChannel =
      session.peerConnection.createDataChannel("oai-events");
  }

  private async setupWebRTC(
    session: OpenAILiveSession,
    config?: LiveConnectConfig,
  ) {
    this.initializeRTCPeerConnectionAndDataChannel(session, config);
    await this.establishSDPConnection(session);
  }

  async connect(config?: LiveConnectConfig): Promise<OpenAILiveSession> {
    const session = new OpenAILiveSession();
    await this.setupWebRTC(session, config);
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
          tools: config?.tools?.map(toOpenAILiveTool),
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
