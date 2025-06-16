import { ModalityType } from "@llamaindex/core/schema";
import { openai } from "@llamaindex/openai";
import { liveEvents, LiveLLMSession } from "llamaindex";
import React, { useRef, useState } from "react";

export const AudioChat: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sessionRef = useRef<LiveLLMSession | null>(null);

  const startChat = async () => {
    try {
      const llm = openai({
        apiKey: "your api key here",
        model: "gpt-4o-realtime-preview-2025-06-03",
      });

      const session = await llm.live.connect({
        systemInstruction: "You are a helpful assistant who speaks naturally.",
        responseModality: [ModalityType.TEXT, ModalityType.AUDIO],
      });

      sessionRef.current = session;

      setIsConnected(true);

      // Listen for events
      for await (const event of session.streamEvents()) {
        console.log("event received", event);
        if (liveEvents.open.include(event)) {
          console.log("Connection open, sending initial message");
          if (session.peerConnection) {
            // setupAudioStream(session.peerConnection);
          }
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
      setIsConnected(false);
    }
  };

  const stopChat = async () => {
    if (sessionRef.current) {
      await sessionRef.current.disconnect();
      sessionRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setIsConnected(false);
  };

  return (
    <div className="audio-chat-container">
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="controls">
        <button
          onClick={isConnected ? stopChat : startChat}
          className={isConnected ? "connected" : ""}
        >
          {isConnected ? "Stop Chat" : "Start Chat"}
        </button>

        <audio ref={audioRef} />
      </div>
    </div>
  );
};
