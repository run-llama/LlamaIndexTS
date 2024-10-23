import { NpmInstall } from "@/components/npm-install";
import { TextEffect } from "@/components/text-effect";
import { Button } from "@/components/ui/button";
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
      </div>
    </main>
  );
}
