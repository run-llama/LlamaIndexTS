import { useChatMessage } from "@llamaindex/chat-ui";
import { FileCode } from "lucide-react";
import { useMemo } from "react";
import {
  CodeArtifact,
  DocumentArtifact,
  extractArtifactsFromMessage,
  useChatCanvas,
} from "../../chat-canvas-provider";

export function ArtifactCard() {
  const { message } = useChatMessage();
  const artifact = useMemo(
    () => extractArtifactsFromMessage(message),
    [message],
  );

  if (!artifact?.length) return null;

  return (
    <div className="flex items-center gap-2">
      {artifact.map((artifact, index) => {
        if (artifact.type === "code") {
          return (
            <CodeArtifactCard key={index} artifact={artifact as CodeArtifact} />
          );
        }
        if (artifact.type === "document") {
          return (
            <DocumentArtifactCard
              key={index}
              artifact={artifact as DocumentArtifact}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

function CodeArtifactCard({ artifact }: { artifact: CodeArtifact }) {
  const { setDisplayedArtifact } = useChatCanvas();
  const { file_name, language } = artifact.data;
  return (
    <div
      className="bg-accent flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2 hover:opacity-80"
      onClick={() => setDisplayedArtifact(artifact)}
    >
      <FileCode className="size-7 shrink-0 text-gray-500" />
      <div className="flex flex-col">
        <div className="text font-medium">{file_name}</div>
        <div className="text-sm text-gray-400">{language}</div>
      </div>
    </div>
  );
}

function DocumentArtifactCard({ artifact }: { artifact: DocumentArtifact }) {
  const { setDisplayedArtifact } = useChatCanvas();
  const { title, type } = artifact.data;
  return (
    <div
      className="bg-accent flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2 hover:opacity-80"
      onClick={() => setDisplayedArtifact(artifact)}
    >
      <FileCode className="size-7 shrink-0 text-gray-500" />
      <div className="flex flex-col">
        <div className="text font-medium">{title}</div>
        <div className="text-sm text-gray-400">{type}</div>
      </div>
    </div>
  );
}
