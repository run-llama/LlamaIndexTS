import { Settings, type JSONValue } from "@llamaindex/core/global";
import type { ChatMessage } from "@llamaindex/core/llms";
import { tool } from "@llamaindex/core/tools";
import { z } from "zod";

const ARTIFACT_GENERATION_PROMPT = `You are a skilled content creator. Generate either code or a document artifact.
If users ask for code without specifying a framework or language, you can generate a React component with Nextjs framework. 
Note that for Nextjs, you should use Shadcn components, typescript, @types/node, @types/react, @types/react-dom, postcss, tailwindcss.

You must return ONLY valid JSON:

Return exactly in one of these JSON formats:

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

Your entire response must be valid, parseable JSON that matches one of these formats exactly. Do not include any explanations, markdown formatting, or code blocks around the JSON.
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
