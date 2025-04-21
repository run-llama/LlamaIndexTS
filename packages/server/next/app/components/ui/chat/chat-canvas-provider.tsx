"use client";

import { getChatUIAnnotation, Message, useChatUI } from "@llamaindex/chat-ui";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Artifact<T = unknown> = {
  type: "code" | "document";
  version: number;
  currentVersion: boolean;
  data: T;
};

export type CodeArtifact = Artifact<{
  file_name: string;
  code: string;
  language: string;
}>;

export type DocumentArtifact = Artifact<{
  title: string;
  content: string;
  type: string; // markdown, html,...
}>;

export function extractArtifactsFromMessage(message: Message): Artifact[] {
  const artifacts = getChatUIAnnotation(
    message.annotations,
    "artifact",
  ) as unknown as Artifact[];

  return artifacts ?? [];
}

export function extractArtifactsFromAllMessages(messages: Message[]) {
  return messages.flatMap(extractArtifactsFromMessage);
}

interface ChatCanvasContextType {
  allArtifacts: Artifact[];
  displayedArtifact: Artifact | undefined;
  isCanvasOpen: boolean;
  openArtifactInCanvas: (artifact: Artifact) => void;
  closeCanvas: () => void;
}

const ChatCanvasContext = createContext<ChatCanvasContextType | undefined>(
  undefined,
);

export function ChatCanvasProvider({ children }: { children: ReactNode }) {
  const { messages } = useChatUI();
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [displayedArtifact, setDisplayedArtifact] = useState<Artifact>();

  const allArtifacts = useMemo(
    () => extractArtifactsFromAllMessages(messages),
    [messages],
  );

  const artifactsFromLastMessage = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    const artifacts = extractArtifactsFromMessage(lastMessage);
    return artifacts;
  }, [messages]);

  useEffect(() => {
    // when last message has a artifact, open the canvas
    if (!isCanvasOpen && artifactsFromLastMessage.length > 0) {
      setIsCanvasOpen(true);
      setDisplayedArtifact(artifactsFromLastMessage[0]);
    }
  }, [artifactsFromLastMessage, isCanvasOpen]);

  const openArtifactInCanvas = (artifact: Artifact) => {
    setDisplayedArtifact(artifact);
    setIsCanvasOpen(true);
  };

  const closeCanvas = () => {
    setIsCanvasOpen(false);
    setDisplayedArtifact(undefined);
  };

  return (
    <ChatCanvasContext.Provider
      value={{
        allArtifacts,
        displayedArtifact,
        isCanvasOpen,
        openArtifactInCanvas,
        closeCanvas,
      }}
    >
      {children}
    </ChatCanvasContext.Provider>
  );
}

export function useChatCanvas(): ChatCanvasContextType {
  const context = useContext(ChatCanvasContext);
  if (context === undefined) {
    throw new Error("useChatCanvas must be used within a ChatCanvasProvider");
  }
  return context;
}
