import { Settings, type JSONValue } from "@llamaindex/core/global";
import type { ChatMessage } from "@llamaindex/core/llms";
import { tool } from "@llamaindex/core/tools";
import { z } from "zod";

const ARTIFACT_GENERATION_PROMPT = `You are a highly skilled content creator and software engineer. Your task is to generate either a code artifact or a document artifact based on the user's request.
Follow these instructions exactly:
1. Carefully read the user's requirements. If any details are ambiguous or missing, make reasonable assumptions and clearly reflect those in your output.
2. For code requests:
   - If the user does not specify a framework or language, default to a React component using the Next.js framework.
   - For Next.js, use Shadcn UI components, Typescript, @types/node, @types/react, @types/react-dom, PostCSS, and TailwindCSS.
   - Ensure the code is idiomatic, production-ready, and includes necessary imports.
   - Only generate code relevant to the user's request—do not add extra boilerplate.
3. For document requests:
   - Always generate Markdown (.md) documents.
   - Use clear structure: headings, subheadings, lists, and tables for comparisons.
   - Ensure content is concise, well-organized, and directly addresses the user's needs.
4. Return ONLY valid, parseable JSON in one of the following formats. Do not include any explanations, markdown formatting, or code blocks around the JSON.

For CODE:
{
  "type": "code",
  "data": {
    "file_name": "filename.ext",
    "code": "your code here",
    "language": "programming language"
  }
}

For DOCUMENT (markdown only):
{
  "type": "document",
  "data": {
    "title": "Document Title",
    "content": "Markdown content here",
    "type": "markdown"
  }
}
  
5. Your entire response must be valid JSON matching one of these formats exactly. Do not include any explanations, markdown formatting, or code blocks around the JSON.
---
EXAMPLES
Example (code):
{
  "type": "code",
  "data": {
    "file_name": "MyComponent.tsx",
    "code": "import React from 'react';\nexport default function MyComponent() { return <div>Hello World</div>; }",
    "language": "typescript"
  }
}
Example (document):
{
  "type": "document",
  "data": {
    "title": "Quick Start Guide",
    "content": "# Quick Start\n\nFollow these steps to begin...",
    "type": "markdown"
  }
}
`;

type ArtifactType = "code" | "document";

type Artifact<T = unknown> = {
  created_at: number;
  type: ArtifactType;
  data: T;
};

type CodeArtifact = Artifact<{
  file_name: string;
  code: string;
  language: string;
}>;

type DocumentArtifact = Artifact<{
  title: string;
  content: string;
  type: string;
}>;

export type ArtifactGeneratorToolOutput = CodeArtifact | DocumentArtifact;

export const artifactGenerator = () => {
  return tool({
    name: "artifact_generator",
    description: "Generate an artifact (code or document) based on the input.",
    parameters: z.object({
      requirement: z
        .string()
        .describe("The description of the artifact you want to build."),
      artifactType: z
        .enum(["code", "document"])
        .describe("The type of artifact to generate (code or document)"),
      oldContent: z
        .string()
        .optional()
        .describe("The existing content to be modified"),
    }),
    execute: async ({ requirement, artifactType, oldContent }) => {
      const artifact = await generateArtifact(
        requirement,
        artifactType,
        oldContent,
      );
      return artifact as JSONValue;
    },
  });
};

async function generateArtifact(
  requirement: string,
  artifactType: ArtifactType,
  oldContent?: string,
): Promise<Artifact<unknown> | null> {
  const userMessage = `
  ${artifactType ? `Generate a ${artifactType} artifact: ` : ""}${requirement}
  ${oldContent ? `The existing content is: \n\`\`\`${oldContent}\`\`\`` : ""}
  `;

  const messages: ChatMessage[] = [
    { role: "system", content: ARTIFACT_GENERATION_PROMPT },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await Settings.llm.chat({ messages });
    const content = response.message.content.toString();
    const jsonContent = content
      .replace(/^```json\s*|\s*```$/g, "")
      .replace(/^`+|`+$/g, "")
      .trim();

    const parsedResponse = JSON.parse(jsonContent);

    const artifact: Artifact = {
      type: parsedResponse.type,
      data: parsedResponse.data,
      created_at: Date.now(),
    };

    return artifact;
  } catch (error) {
    console.error("Failed to generate artifact", error);
    return null;
  }
}
