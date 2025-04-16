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
import { Supports } from "@/components/supports";
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
      <h1 className="mb-4 text-center text-4xl font-bold md:text-6xl">
        Build context-augmented web apps using
        <br /> <span className="text-blue-500">LlamaIndex.TS</span>
      </h1>
      <p className="text-fd-muted-foreground mb-12 text-center text-xl">
        LlamaIndex.TS is the JS/TS version of{" "}
        <a href="https://llamaindex.ai">LlamaIndex</a>, the framework for
        building agentic generative AI applications connected to your data.
      </p>
      <div className="text-fd-muted-foreground mb-12 text-center text-lg">
        <span>Designed for building web applications in </span>
        <Supports />
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
          heading="From the simplest to the most complex"
          description="LlamaIndex.TS is designed to be simple to get started, but powerful enough to build complex, agentic AI applications using multi-agents."
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
                `import { openai } from "@llamaindex/openai";

const llm = openai();
const response = await llm.complete({ prompt: "How are you?" });`,
                `import { openai } from "@llamaindex/openai";

const llm = openai();
const response = await llm.chat({
  messages: [{ content: "Tell me a joke.", role: "user" }],
});`,
                `import { agent } from "llamaindex";
import { openai } from "@llamaindex/openai";

const analyseAgent = agent({
  llm: openai({ model: "gpt-4o" }),
  tools: [analyseTools],
  systemPrompt,
});
const response = await analyseAgent.run(\`Analyse the given data:
\${data}\`);`,
                `import { agent, multiAgent } from "llamaindex";
import { openai } from "@llamaindex/openai";

const analyseAgent = agent({
  name: "AnalyseAgent",
  llm: openai({ model: "gpt-4o" }),
  tools: [analyseTools],
});
const reporterAgent = agent({
  name: "ReporterAgent",
  llm: openai({ model: "gpt-4o" }),
  tools: [reporterTools],
  canHandoffTo: [analyseAgent],
});

const agents = multiAgent({
  agents: [analyseAgent, reporterAgent],
  rootAgent: reporterAgent,
});

const response = await agents.run(\`Analyse the given data:
\${data}\`);`,
              ]}
            />
          </Suspense>
        </Feature>
        <Feature
          icon={Bot}
          subheading="Agents"
          heading="Build agentic RAG applications"
          description="Truly powerful retrieval-augmented generation applications use agentic techniques, and LlamaIndex.TS makes it easy to build them."
        >
          <CodeBlock
            code={`import { agent, SimpleDirectoryReader, VectorStoreIndex } from "llamaindex";
import { openai } from "@llamaindex/openai";

// load documents from current directoy into an index
const reader = new SimpleDirectoryReader();
const documents = await reader.loadData(currentDir);
const index = await VectorStoreIndex.fromDocuments(documents);

const myAgent = agent({
  llm: openai({ model: "gpt-4o" }),
  tools: [index.queryTool()],
});

await myAgent.run('...');`}
            lang="ts"
          />
        </Feature>
        <Feature
          icon={Blocks}
          subheading="Providers"
          heading="LLMs, Data Loaders, Vector Stores and more!"
          description="LlamaIndex.TS has hundreds of integrations to connect to your data, index it, and query it with LLMs."
        >
          <div className="mt-8 flex flex-col gap-8">
            <div>
              <h3 className="text-fd-muted-foreground mb-2 text-lg font-semibold">
                LLMs
              </h3>
              <InfiniteLLMProviders />
            </div>
            <div>
              <h3 className="text-fd-muted-foreground mb-2 text-lg font-semibold">
                Vector Stores
              </h3>
              <InfiniteVectorStoreProviders />
            </div>
          </div>
        </Feature>
        <Feature
          icon={Terminal}
          subheading="create-llama CLI"
          heading="Build a RAG app with a single command"
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
