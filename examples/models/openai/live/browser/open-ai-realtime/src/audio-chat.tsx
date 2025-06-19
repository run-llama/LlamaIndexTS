import { openai } from "@llamaindex/openai";
import { liveEvents, LiveLLMSession, ModalityType } from "llamaindex";
import { useEffect, useRef, useState } from "react";

const MicIcon = ({ isConnected }: { isConnected: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isConnected ? (
      <>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </>
    ) : (
      <>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      </>
    )}
  </svg>
);

const WaveAnimation = () => (
  <div className="wave-animation">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="wave" style={{ animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

export const AudioChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [status, setStatus] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const sessionRef = useRef<LiveLLMSession | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startChat = async () => {
    try {
      setStatus("Initializing microphone...");
      const userStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setStream(userStream);

      setStatus("Connecting to AI...");
      const apiKey = prompt("Please enter your OpenAI API key:");
      if (!apiKey) {
        throw new Error("API key is required");
      }

      // move this call to the server side for security reasons
      // Do not store the API key in the frontend!
      const serverllm = openai({
        apiKey: apiKey,
        model: "gpt-4o-realtime-preview-2025-06-03",
      });

      const tempKey = await serverllm.live.getEphemeralKey();

      const llm = openai({
        apiKey: tempKey,
        model: "gpt-4o-realtime-preview-2025-06-03",
      });
      const session = await llm.live.connect({
        systemInstruction: "You are a helpful assistant who speaks naturally.",
        responseModality: [ModalityType.TEXT, ModalityType.AUDIO],
        audioConfig: {
          stream: userStream,
          onTrack: (remoteStream) => {
            if (audioRef.current && remoteStream) {
              audioRef.current.srcObject = remoteStream;
              audioRef.current.play().catch(console.error);
            }
          },
        },
      });

      sessionRef.current = session;
      setIsConnected(true);
      setStatus("Connected! Listening...");

      for await (const event of session.streamEvents()) {
        if (liveEvents.open.include(event)) {
          setMessages((prev) => [
            ...prev,
            {
              role: "user",
              content: "Hello, I'm ready to chat!",
            },
          ]);
          session.sendMessage({
            content: "Hello, I'm ready to chat!",
            role: "user",
          });
        } else if (liveEvents.text.include(event)) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: event.text,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      setStatus("Error connecting. Please try again.");
      setIsConnected(false);
    }
  };

  const stopChat = async () => {
    setStatus("Disconnecting...");
    if (sessionRef.current) {
      await sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setIsConnected(false);
    setStatus("");
  };

  return (
    <div className="audio-chat-container">
      <h1>AI Voice Chat</h1>
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="controls">
        {status && <div className="status-indicator">{status}</div>}
        <button
          className={`mic-button ${isConnected ? "connected" : ""}`}
          onClick={isConnected ? stopChat : startChat}
          title={isConnected ? "Stop Chat" : "Start Chat"}
        >
          <MicIcon isConnected={isConnected} />
          {isConnected && <WaveAnimation />}
        </button>
        <audio ref={audioRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};
