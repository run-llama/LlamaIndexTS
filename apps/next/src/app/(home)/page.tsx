import { CodeBlock } from "@/components/code-block";
import { Contributing } from "@/components/contribution";
import { Feature } from "@/components/feature";
import { NpmInstall } from "@/components/npm-install";
import { TextEffect } from "@/components/text-effect";
import { Button } from "@/components/ui/button";
import { SiStackblitz } from "@icons-pack/react-simple-icons";
import { Bot, Terminal } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
        Build RAG Web App using
        <br /> <span className="text-blue-500">LlamaIndex.TS</span>
      </h1>
      <p className="text-xl text-center text-gray-600 mb-12">
        LlamaIndex.TS is the JS/TS library from our popular Python library
        llama-index for building LLM applications
      </p>
      <div className="text-center text-lg text-gray-600 mb-12">
        <span>Designed for building web applications under </span>
        <TextEffect />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/docs">
          <Button className="bg-black text-white">Get Started</Button>
        </Link>
        <NpmInstall />
        <Link
          href="https://stackblitz.com/github/run-llama/LlamaIndexTS/tree/main/examples"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Button className="bg-blue-500 text-white hover:bg-blue-600">
            <SiStackblitz />
            Playground
          </Button>
        </Link>
      </div>
      <div className="mt-4" />
      <div className="grid grid-cols-1 border-r md:grid-cols-2">
        <Feature
          icon={Bot}
          subheading="Agent"
          heading="Build agent for RAG"
          description="Build agents for RAG using LlamaIndex.TS. Agents are the core building blocks of RAG applications."
        >
          <CodeBlock
            code={`
import { FunctionTool } from "llamaindex";
import { OpenAIAgent } from "@llamaindex/openai";

const interpreterTool = FunctionTool.from(...);
const systemPrompt = \`...\`;

const agent = new OpenAIAgent({
  llm,
  tools: [interpreterTool],
  systemPrompt,
});

await agent.chat('...');`}
            lang="ts"
          />
        </Feature>
        <Feature
          icon={Terminal}
          subheading="Create Llama CLI"
          heading="CLI for starting RAG app with one line"
          description="A command line tool to generate LlamaIndex apps, the easiest way to get started with LlamaIndex."
        >
          <CodeBlock
            code="npx create-llama@latest"
            lang="bash"
            wrapper={{
              title: "Terminal",
              allowCopy: true,
            }}
          />
          <pre className="grid grid-cols-1 rounded-lg border bg-card p-4 text-xs leading-loose">
            <code>
              <div>? What app do you want to build?</div>
              <ul>
                <li>❯ Agentic RAG</li>
                <li> Data Scientist</li>
                <li> Financial Report Generator (using Workflows)</li>
                <li> Code Artifact Agent</li>
                <li> Structured extraction</li>
              </ul>
            </code>
            <code>
              ? What language do you want to use?
              <ul>
                <li>❯ TypeScript</li>
                <li> Python</li>
              </ul>
            </code>
            <code className="text-muted-foreground">{`Initializing project with template...`}</code>
            <code className="text-green-500">
              Success! Created app at /path/to/app
            </code>
          </pre>
        </Feature>
      </div>
      <Contributing />
      <div className="border-b" />
    </main>
  );
}
