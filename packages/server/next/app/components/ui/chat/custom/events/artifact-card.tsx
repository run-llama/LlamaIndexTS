import { useChatMessage } from "@llamaindex/chat-ui";
import { File, FileCode, LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "../../../badge";
import { Button } from "../../../button";
import {
  Artifact,
  CodeArtifact,
  DocumentArtifact,
  extractArtifactsFromMessage,
  useChatCanvas,
} from "../../chat-canvas-provider";

export function ArtifactCards() {
  const { message } = useChatMessage();
  const artifacts = useMemo(
    () => extractArtifactsFromMessage(message),
    [message],
  );

  if (!artifacts?.length) return null;

  return (
    <div className="flex items-center gap-2">
      {artifacts.map((artifact, index) => (
        <ArtifactCard key={index} artifact={artifact} />
      ))}
    </div>
  );
}

const IconMap: Record<Artifact["type"], LucideIcon> = {
  code: FileCode,
  document: File,
};

const getCardTitle = (artifact: Artifact) => {
  if (artifact.type === "code") {
    const { file_name } = artifact.data as CodeArtifact["data"];
    return file_name;
  }
  if (artifact.type === "document") {
    const { title } = artifact.data as DocumentArtifact["data"];
    return title;
  }
  return "";
};

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const { openArtifactInCanvas, getArtifactVersion, restoreArtifact } =
    useChatCanvas();
  const { versionNumber, isLatest } = getArtifactVersion(artifact);

  const Icon = IconMap[artifact.type];
  const title = getCardTitle(artifact);

  return (
    <div
      className={
        "border-border flex w-full max-w-72 cursor-pointer items-center justify-between gap-2 rounded-lg border-2 p-2 hover:border-blue-500"
      }
    >
      <div
        className="flex flex-1 items-center gap-2"
        onClick={() => openArtifactInCanvas(artifact)}
      >
        <Icon className="size-7 shrink-0 text-blue-500" />
        <div className="flex flex-col">
          <div className="text-sm font-semibold">Version {versionNumber}</div>
          {title && <div className="text-xs text-gray-600">{title}</div>}
        </div>
      </div>
      {isLatest ? (
        <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">Latest</Badge>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 text-xs"
          onClick={() => restoreArtifact(artifact)}
        >
          Restore
        </Button>
      )}
    </div>
  );
}
