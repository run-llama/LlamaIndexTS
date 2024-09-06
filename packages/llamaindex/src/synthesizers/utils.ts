import type { MessageContentDetail } from "@llamaindex/core/llms";
import {
  ImageNode,
  MetadataMode,
  ModalityType,
  splitNodesByType,
  type BaseNode,
} from "@llamaindex/core/schema";
import { imageToDataUrl } from "../internal/utils.js";
import type { BasePromptTemplate } from '@llamaindex/core/prompts';

export async function createMessageContent(
  prompt: BasePromptTemplate,
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
  prompt: BasePromptTemplate,
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
          text: prompt.format({
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
