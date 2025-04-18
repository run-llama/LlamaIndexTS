import { getChatUIAnnotation, useChatMessage } from "@llamaindex/chat-ui";
import { Markdown } from "@llamaindex/chat-ui/widgets";

type CodeArtifact = {
  type: "code";
  version: number;
  data: {
    file_name: string;
    language: string;
    code: string;
  };
  currentVersion: boolean;
};

export function Artifact() {
  const {
    message: { annotations },
  } = useChatMessage();

  const events = getChatUIAnnotation(
    annotations,
    "artifact",
  ) as unknown as CodeArtifact[];

  if (!events?.length) return null;

  const artifact = events[0];

  // TODO: implement click to open canvas component
  return <Markdown content={artifact.data.code} />;
}
