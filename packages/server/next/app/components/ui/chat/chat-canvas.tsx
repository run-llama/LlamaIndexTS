"use client";

import { CodeBlock } from "@llamaindex/chat-ui/widgets";
import { memo } from "react";
import {
  CodeArtifact,
  DocumentArtifact,
  useChatCanvas,
} from "./chat-canvas-provider";

export const ChatCanvas = memo(() => {
  const { displayedArtifact } = useChatCanvas();

  if (displayedArtifact?.type === "code") {
    return <CodeArtifactViewer artifact={displayedArtifact as CodeArtifact} />;
  }

  if (displayedArtifact?.type === "document") {
    return (
      <DocumentArtifactViewer
        artifact={displayedArtifact as DocumentArtifact}
      />
    );
  }

  return null;
});

function CodeArtifactViewer({ artifact }: { artifact: CodeArtifact }) {
  const {
    data: { language, code },
  } = artifact;

  return (
    <div className="h-full w-2/3 pt-4">
      <div className="bg-background h-full w-full rounded-lg p-2">
        <CodeBlock language={language} value={code} />
      </div>
    </div>
  );
}

function DocumentArtifactViewer({ artifact }: { artifact: DocumentArtifact }) {
  return <div>TODO</div>;
}
