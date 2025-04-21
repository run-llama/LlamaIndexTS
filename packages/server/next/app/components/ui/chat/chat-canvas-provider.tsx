"use client";

import { getChatUIAnnotation, Message, useChatUI } from "@llamaindex/chat-ui";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
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
  displayedArtifact: Artifact | undefined;
  setDisplayedArtifact: Dispatch<SetStateAction<Artifact | undefined>>;
  allArtifacts: Artifact[];
  lastArtifact: Artifact | undefined;
}

const ChatCanvasContext = createContext<ChatCanvasContextType | undefined>(
  undefined,
);

export function ChatCanvasProvider({ children }: { children: ReactNode }) {
  const { messages } = useChatUI();
  const [_displayedArtifact, setDisplayedArtifact] = useState<Artifact>();

  const allArtifacts = useMemo(
    () => extractArtifactsFromAllMessages(messages),
    [messages],
  );

  const lastArtifact = useMemo(
    () =>
      allArtifacts.length > 0
        ? allArtifacts[allArtifacts.length - 1]
        : undefined,
    [allArtifacts],
  );

  const displayedArtifact = _displayedArtifact ?? lastArtifact; // fallback to last artifact

  return (
    <ChatCanvasContext.Provider
      value={{
        displayedArtifact,
        setDisplayedArtifact,
        allArtifacts,
        lastArtifact,
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
