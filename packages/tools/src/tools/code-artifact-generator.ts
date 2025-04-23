import { Settings, type JSONValue } from "@llamaindex/core/global";
import type { ChatMessage, LLM } from "@llamaindex/core/llms";
import { tool } from "@llamaindex/core/tools";
import { z } from "zod";

const CODE_ARTIFACT_GENERATION_PROMPT = `You are a highly skilled software engineer. Your task is to generate a code artifact based on the user's request.
Follow these instructions exactly:
1. Carefully read the user's requirements. If any details are ambiguous or missing, make reasonable assumptions and clearly reflect those in your output.
2. For code requests:
   - If the user does not specify a framework or language, default to a React component using the Next.js framework.
   - For Next.js, use Shadcn UI components, Typescript, @types/node, @types/react, @types/react-dom, PostCSS, and TailwindCSS.
   - Please don't use inline styles or any external libraries.
   - For Shadcn ui components, you can import them like this: import { Button } from "@/components/ui/button"
   - Ensure the code is idiomatic, production-ready, and includes necessary imports.
   - Only generate code relevant to the user's request—do not add extra boilerplate.
3. Return ONLY valid, parseable JSON in the following format. Do not include any explanations, markdown formatting, or code blocks around the JSON.

{
  "type": "code",
  "data": {
    "file_name": "filename.ext",
    "code": "your code here",
    "language": "programming language"
  }
}
  
4. Your entire response must be valid JSON matching this format exactly. Do not include any explanations, markdown formatting, or code blocks around the JSON.
---
EXAMPLE
{
  "type": "code",
  "data": {
    "file_name": "MyComponent.tsx",
    "code": "import React from 'react';\nexport default function MyComponent() { return <div>Hello World</div>; }",
    "language": "typescript"
  }
}`;

type CodeArtifact = {
  created_at: number;
  type: "code";
  data: {
    file_name: string;
    code: string;
    language: string;
  };
};

export type CodeArtifactGeneratorToolOutput = CodeArtifact;

export const codeArtifactGenerator = ({
  llm,
  lastArtifact,
}: {
  llm?: LLM;
  lastArtifact?: CodeArtifact;
}) => {
  return tool({
    name: "code_artifact_generator",
    description: "Generate a code artifact based on the input.",
    parameters: z.object({
      requirement: z
        .string()
        .describe("The description of the code artifact you want to build."),
    }),
    execute: async ({ requirement }) => {
      const artifact = await generateCodeArtifact(
        requirement,
        lastArtifact,
        llm,
      );
      return artifact as JSONValue;
    },
  });
};

async function generateCodeArtifact(
  requirement: string,
  lastArtifact?: CodeArtifact,
  llm?: LLM,
): Promise<CodeArtifact | null> {
  const userMessage = `
  Generate a code artifact: ${requirement}
  ${lastArtifact ? `The existing content is: \n\`\`\`${lastArtifact.data.code}\`\`\`` : ""}`;

  const messages: ChatMessage[] = [
    { role: "system", content: CODE_ARTIFACT_GENERATION_PROMPT },
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

    const artifact: CodeArtifact = {
      type: "code",
      data: parsedResponse.data,
      created_at: Date.now(),
    };

    return artifact;
  } catch (error) {
    console.error("Failed to generate code artifact", error);
    return null;
  }
}
