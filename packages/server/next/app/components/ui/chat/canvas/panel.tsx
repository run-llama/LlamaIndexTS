"use client";

import { ChatCanvas, useChatCanvas } from "@llamaindex/chat-ui";
import { ResizableHandle, ResizablePanel } from "../../resizable";
import { CodeArtifactRenderer } from "./preview";

export function ChatCanvasPanel() {
  const { displayedArtifact, isCanvasOpen } = useChatCanvas();
  if (!displayedArtifact || !isCanvasOpen) return null;

  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} minSize={50}>
        <ChatCanvas className="w-full">
          <ChatCanvas.CodeArtifact
            tabs={{ preview: <CodeArtifactRenderer /> }}
          />
          <ChatCanvas.DocumentArtifact />
        </ChatCanvas>
      </ResizablePanel>
    </>
  );
}
