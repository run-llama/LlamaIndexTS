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
  created_at: number;
  type: "code" | "document";
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

// extract artifacts from all messages (sort ascending by created_at)
export function extractArtifactsFromAllMessages(messages: Message[]) {
  return messages
    .flatMap(extractArtifactsFromMessage)
    .sort((a, b) => a.created_at - b.created_at);
}

// check if two artifacts are equal by comparing their type and created time
export function isEqualArtifact(a: Artifact, b: Artifact) {
  return a.type === b.type && a.created_at === b.created_at;
}

interface ChatCanvasContextType {
  allArtifacts: Artifact[];
  displayedArtifact: Artifact | undefined;
  isCanvasOpen: boolean;
  openArtifactInCanvas: (artifact: Artifact) => void;
  closeCanvas: () => void;
  uniqueErrors: string[];
  appendErrors: (errors: string[]) => void;
  clearErrors: () => void;
  getArtifactVersion: (artifact: Artifact) => {
    versionNumber: number;
    isLatest: boolean;
  };
  restoreArtifact: (artifact: Artifact) => void;
}

const ChatCanvasContext = createContext<ChatCanvasContextType | undefined>(
  undefined,
);

export function ChatCanvasProvider({
  children,
  addMessages,
}: {
  children: ReactNode;
  addMessages: (messages: Message[]) => void;
}) {
  const { messages, isLoading } = useChatUI();

  const [isCanvasOpen, setIsCanvasOpen] = useState(false); // whether the canvas is open
  const [displayedArtifact, setDisplayedArtifact] = useState<Artifact>(); // the artifact currently displayed in the canvas
  const [errors, setErrors] = useState<string[]>([]); // contain all errors when compiling with Babel and runtime

  const allArtifacts = useMemo(
    () => extractArtifactsFromAllMessages(messages),
    [messages],
  );

  // get all artifacts from the last message, this may not be the latest artifact in case last message doesn't have any artifact
  const artifactsFromLastMessage = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return [];
    const artifacts = extractArtifactsFromMessage(lastMessage);
    return artifacts;
  }, [messages]);

  useEffect(() => {
    // when stream is loading and last message has a artifact, open the canvas with that artifact
    if (artifactsFromLastMessage.length > 0 && isLoading) {
      setIsCanvasOpen(true);
      setDisplayedArtifact(
        artifactsFromLastMessage[artifactsFromLastMessage.length - 1],
      );
    }
  }, [artifactsFromLastMessage, isCanvasOpen, isLoading]);

  const openArtifactInCanvas = (artifact: Artifact) => {
    setDisplayedArtifact(artifact);
    setIsCanvasOpen(true);
  };

  const getArtifactVersion = (artifact: Artifact) => {
    const versionNumber =
      allArtifacts.findIndex((a) => isEqualArtifact(a, artifact)) + 1;
    return {
      versionNumber,
      isLatest: versionNumber === allArtifacts.length,
    };
  };

  const restoreArtifact = (artifact: Artifact) => {
    const newArtifact = {
      ...artifact,
      created_at: Date.now(),
    };

    addMessages([
      {
        role: "user",
        content: `Restore to version ${getArtifactVersion(artifact).versionNumber}`,
      },
      {
        role: "assistant",
        content: `Successfully restored to version ${getArtifactVersion(artifact).versionNumber}`,
        annotations: [
          {
            type: "artifact",
            data: newArtifact,
          },
        ],
      },
    ]);

    openArtifactInCanvas(newArtifact);
  };

  const closeCanvas = () => {
    setIsCanvasOpen(false);
    setDisplayedArtifact(undefined);
  };

  const appendErrors = (errors: string[]) => {
    setIsCanvasOpen(true);
    setErrors((prev) => [...prev, ...errors]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const uniqueErrors = useMemo(() => {
    return Array.from(new Set(errors));
  }, [errors]);

  return (
    <ChatCanvasContext.Provider
      value={{
        allArtifacts,
        displayedArtifact,
        isCanvasOpen,
        openArtifactInCanvas,
        closeCanvas,
        uniqueErrors,
        appendErrors,
        clearErrors,
        getArtifactVersion,
        restoreArtifact,
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
