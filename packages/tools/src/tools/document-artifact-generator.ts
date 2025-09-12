import { Settings, type JSONValue } from "@llamaindex/core/global";
import type { ChatMessage, LLM } from "@llamaindex/core/llms";
import { tool } from "@llamaindex/core/tools";
import { z } from "@llamaindex/core/zod";

const DOCUMENT_ARTIFACT_GENERATION_PROMPT = `You are a highly skilled content creator. Your task is to generate a document artifact based on the user's request.
Follow these instructions exactly:
1. Carefully read the user's requirements. If any details are ambiguous or missing, make reasonable assumptions and clearly reflect those in your output.
2. For document requests:
   - Always generate Markdown (.md) documents.
   - Use clear structure: headings, subheadings, lists, and tables for comparisons.
   - Ensure content is concise, well-organized, and directly addresses the user's needs.
3. Return ONLY valid, parseable JSON in the following format. Do not include any explanations, markdown formatting, or code blocks around the JSON.

{
  "type": "document",
  "data": {
    "title": "Document Title",
    "content": "Markdown content here",
    "type": "markdown"
  }
}
  
4. Your entire response must be valid JSON matching this format exactly. Do not include any explanations, markdown formatting, or code blocks around the JSON.
---
EXAMPLE
{
  "type": "document",
  "data": {
    "title": "Quick Start Guide",
    "content": "# Quick Start\n\nFollow these steps to begin...",
    "type": "markdown"
  }
}`;

type DocumentArtifact = {
  created_at: number;
  type: "document";
  data: {
    title: string;
    content: string;
    type: string;
  };
};

export type DocumentArtifactGeneratorToolOutput = DocumentArtifact;

export const documentArtifactGenerator = ({
  llm,
  lastArtifact,
}: {
  llm?: LLM;
  lastArtifact?: DocumentArtifact;
}) => {
  return tool({
    name: "document_artifact_generator",
    description: "Generate a document artifact based on the input.",
    parameters: z.object({
      requirement: z
        .string()
        .describe(
          "The description of the document artifact you want to build.",
        ),
    }),
    execute: async ({ requirement }) => {
      const artifact = await generateDocumentArtifact(
        requirement,
        lastArtifact,
        llm,
      );
      return artifact as JSONValue;
    },
  });
};

async function generateDocumentArtifact(
  requirement: string,
  lastArtifact?: DocumentArtifact,
  llm?: LLM,
): Promise<DocumentArtifact | null> {
  const userMessage = `
  Generate a document artifact: ${requirement}
  ${lastArtifact ? `The existing content is: \n\`\`\`${lastArtifact.data.content}\`\`\`` : ""}
  `;

  const messages: ChatMessage[] = [
    { role: "system", content: DOCUMENT_ARTIFACT_GENERATION_PROMPT },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await (llm ?? Settings.llm).chat({ messages });
    const content = response.message.content.toString();
    const jsonContent = content
      .replace(/^```json\s*|\s*```$/g, "")
      .replace(/^`+|`+$/g, "")
      .trim();

    const parsedResponse = JSON.parse(jsonContent);

    const artifact: DocumentArtifact = {
      type: "document",
      data: parsedResponse.data,
      created_at: Date.now(),
    };

    return artifact;
  } catch (error) {
    console.error("Failed to generate document artifact", error);
    return null;
  }
}
