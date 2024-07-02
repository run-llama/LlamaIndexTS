import type { MessageContentDetail } from "@llamaindex/core/llms";
import {
  ImageNode,
  MetadataMode,
  ModalityType,
  splitNodesByType,
  type BaseNode,
} from "@llamaindex/core/schema";
import type { SimplePrompt } from "../Prompt.js";
import { imageToDataUrl } from "../embeddings/utils.js";

export async function createMessageContent(
  prompt: SimplePrompt,
  nodes: BaseNode[],
  extraParams: Record<string, string | undefined> = {},
  metadataMode: MetadataMode = MetadataMode.NONE,
): Promise<MessageContentDetail[]> {
  const content: MessageContentDetail[] = [];
  const nodeMap = splitNodesByType(nodes);
  for (const type in nodeMap) {
    // for each retrieved modality type, create message content
    const nodes = nodeMap[type as ModalityType];
    if (nodes) {
      content.push(
        ...(await createContentPerModality(
          prompt,
          type as ModalityType,
          nodes,
          extraParams,
          metadataMode,
        )),
      );
    }
  }
  return content;
}

// eslint-disable-next-line max-params
async function createContentPerModality(
  prompt: SimplePrompt,
  type: ModalityType,
  nodes: BaseNode[],
  extraParams: Record<string, string | undefined>,
  metadataMode: MetadataMode,
): Promise<MessageContentDetail[]> {
  switch (type) {
    case ModalityType.TEXT:
      return [
        {
          type: "text",
          text: prompt({
            ...extraParams,
            context: nodes.map((r) => r.getContent(metadataMode)).join("\n\n"),
          }),
        },
      ];
    case ModalityType.IMAGE:
      const images: MessageContentDetail[] = await Promise.all(
        (nodes as ImageNode[]).map(async (node) => {
          return {
            type: "image_url",
            image_url: {
              url: await imageToDataUrl(node.image),
            },
          } satisfies MessageContentDetail;
        }),
      );
      return images;
    default:
      return [];
  }
}
