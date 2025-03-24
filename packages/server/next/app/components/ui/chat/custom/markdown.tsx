import { SourceData } from "@llamaindex/chat-ui";
import { Markdown as MarkdownUI } from "@llamaindex/chat-ui/widgets";
import { useClientConfig } from "../hooks/use-config";

const preprocessMedia = (content: string) => {
  // Remove `sandbox:` from the beginning of the URL before rendering markdown
  // OpenAI models sometimes prepend `sandbox:` to relative URLs - this fixes it
  return content.replace(/(sandbox|attachment|snt):/g, "");
};

export function Markdown({
  content,
  sources,
}: {
  content: string;
  sources?: SourceData;
}) {
  const { backend } = useClientConfig();
  const processedContent = preprocessMedia(content);
  return (
    <MarkdownUI
      content={processedContent}
      backend={backend}
      sources={sources}
    />
  );
}
