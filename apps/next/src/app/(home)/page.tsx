import { CodeBlock } from "@/components/code-block";
import { Contributing } from "@/components/contribution";
import { CreateAppAnimation } from "@/components/create-app-animation";
import { Feature } from "@/components/feature";
import {
  InfiniteLLMProviders,
  InfiniteVectorStoreProviders,
} from "@/components/infinite-providers";
import { MagicMove } from "@/components/magic-move";
import { NpmInstall } from "@/components/npm-install";
import { TextEffect } from "@/components/text-effect";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DOCUMENT_URL } from "@/lib/const";
import { SiStackblitz } from "@icons-pack/react-simple-icons";
import {
  CodeBlock as FumaCodeBlock,
  Pre,
} from "fumadocs-ui/components/codeblock";
import { Blocks, Bot, Footprints, Terminal } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
        Build RAG Web App using
        <br /> <span className="text-blue-500">LlamaIndex.TS</span>
      </h1>
      <p className="text-xl text-center text-fd-muted-foreground mb-12 ">
        LlamaIndex.TS is the JS/TS library from our popular Python library
        llama-index for building LLM applications
      </p>
      <div className="text-center text-lg text-fd-muted-foreground mb-12">
        <span>Designed for building web applications under </span>
        <TextEffect />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href={DOCUMENT_URL}>
          <Button variant="outline">Get Started</Button>
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
          icon={Footprints}
          subheading="Progressive"
          heading="Adding AI feature from simple to complex"
          description="LlamaIndex.TS is designed to be simple to start with and can be extended to build complex AI applications."
        >
          <Suspense
            fallback={
              <FumaCodeBlock allowCopy={false}>
                <Pre>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </Pre>
              </FumaCodeBlock>
            }
          >
            <MagicMove
              code={[
                `import { OpenAI } from "llamaindex";
const llm = new OpenAI();
const response = await llm.complete({ prompt: "How are you?" });`,
                `import { OpenAI } from "llamaindex";
const llm = new OpenAI();
const response = await llm.chat({
  messages: [{ content: "Tell me a joke.", role: "user" }],
});`,
                `import { OpenAI, ChatMemoryBuffer } from "llamaindex";
const llm = new OpenAI({ model: 'gpt4o-turbo' });
const buffer = new ChatMemoryBuffer({
  tokenLimit: 128_000,
})
buffer.put({ content: "Tell me a joke.", role: "user" })
const response = await llm.chat({
  messages: buffer.getMessages(),
  stream: true
});`,
                `import { OpenAIAgent, ChatMemoryBuffer } from "llamaindex";
const agent = new OpenAIAgent({
  llm,
  tools: [...myTools]
  systemPrompt,
});
const buffer = new ChatMemoryBuffer({
  tokenLimit: 128_000,
})
buffer.put({ content: "Analysis the data based on the given data.", role: "user" })
buffer.put({ content: \`\${data}\`, role: "user" })
const response = await agent.chat({
  message: buffer.getMessages(),
});`,
              ]}
            />
          </Suspense>
        </Feature>
        <Feature
          icon={Bot}
          subheading="Agent"
          heading="Build agent for RAG"
          description="Build agents for RAG using LlamaIndex.TS. Agents are the core building blocks of RAG applications."
        >
          <CodeBlock
            code={`import { FunctionTool } from "llamaindex";
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
          icon={Blocks}
          subheading="Providers"
          heading="LLM / Data Loader / Vector Store"
          description="LlamaIndex.TS provides various providers to turn your data into valuable insights."
        >
          <div className="mt-8 flex flex-col gap-8">
            <div>
              <h3 className="text-lg font-semibold text-fd-muted-foreground mb-2">
                LLM
              </h3>
              <InfiniteLLMProviders />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-fd-muted-foreground mb-2">
                Vector Store
              </h3>
              <InfiniteVectorStoreProviders />
            </div>
          </div>
        </Feature>
        <Feature
          icon={Terminal}
          subheading="Create Llama CLI"
          heading="CLI for starting RAG app with one line"
          description="A command line tool to generate LlamaIndex apps, the easiest way to get started with LlamaIndex."
        >
          <div className="my-6">
            <CreateAppAnimation />
          </div>
        </Feature>
      </div>
      <Contributing />
      <div className="border-b" />
    </main>
  );
}
