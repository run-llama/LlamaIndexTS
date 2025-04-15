"use client";
import { createContextState } from "foxact/context-state";
import { useIsClient } from "foxact/use-is-client";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { lazy, Suspense, use, useMemo } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import Parser from "web-tree-sitter";

import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { CodeSplitter } from "@llamaindex/node-parser/code";
import { useShiki } from "fumadocs-core/highlight/client";

let promise: Promise<CodeSplitter>;
if (typeof window !== "undefined") {
  promise = Parser.init({
    locateFile(scriptName: string) {
      return "/" + scriptName;
    },
  }).then(async () => {
    const parser = new Parser();
    const Lang = await Parser.Language.load("/tree-sitter-typescript.wasm");
    parser.setLanguage(Lang);
    return new CodeSplitter({
      getParser: () => parser,
      maxChars: 100,
    });
  });
}

const [SliderProvider, useSlider, useSetSlider] = createContextState(100);

const [CodeProvider, useCode, useSetCode] =
  createContextState(`interface Person {
  name: string;
  age: number;
}

function greet(person: Person): string {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

const john: Person = {
  name: "John Doe",
  age: 30
};

console.log(greet(john));`);

const Editor = lazy(() => import("react-monaco-editor"));

export const IDE = () => {
  const codeSplitter = use(promise);
  const code = useCode();
  const setCode = useSetCode();
  const maxChars = useSlider();
  const useSetMaxChars = useSetSlider();
  return (
    <div className="flex max-h-96 flex-col overflow-scroll border-r p-4">
      <div>
        <Label>Max Chars {maxChars}</Label>
        <Slider
          className="my-4"
          min={10}
          max={300}
          step={10}
          value={[maxChars]}
          onValueChange={(value) => {
            useSetMaxChars(value[0]);
            codeSplitter.maxChars = value[0];
          }}
        />
      </div>
      <Editor
        editorWillMount={() => {}}
        editorDidMount={() => {
          window.MonacoEnvironment!.getWorkerUrl = (
            _moduleId: string,
            label: string,
          ) => {
            if (label === "json") return "/_next/static/json.worker.js";
            if (label === "css") return "/_next/static/css.worker.js";
            if (label === "html") return "/_next/static/html.worker.js";
            if (label === "typescript" || label === "javascript")
              return "/_next/static/ts.worker.js";
            return "/_next/static/editor.worker.js";
          };
        }}
        editorWillUnmount={() => {}}
        options={{
          minimap: {
            enabled: false,
          },
        }}
        theme="vs-dark"
        height="100%"
        width="100%"
        language="typescript"
        onChange={setCode}
        value={code}
      />
    </div>
  );
};

const Preview = ({ text }: { text: string }) => {
  const rendered = useShiki(text, {
    lang: "ts",
    components: {
      pre: (props) => {
        return <Pre {...props}>{props.children}</Pre>;
      },
    },
  });
  return <CodeBlock className="m-2 py-0">{rendered}</CodeBlock>;
};

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <button
        className="i-ph-arrow-circle-down-fill absolute bottom-0 left-[50%] translate-x-[-50%] rounded-lg text-4xl"
        onClick={() => scrollToBottom()}
      />
    )
  );
}

export const NodePreview = () => {
  const parser = use(promise);
  const code = useCode();
  const maxChars = useSlider();
  const textChunks = useMemo(() => parser.splitText(code), [code, maxChars]);
  return (
    <StickToBottom
      className="relative block max-h-96 overflow-scroll"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content>
        {textChunks.map((chunk, i) => (
          <Preview key={i} text={chunk} />
        ))}
      </StickToBottom.Content>
      <ScrollToBottom />
    </StickToBottom>
  );
};

export const CodeNodeParserDemo = () => {
  const isClient = useIsClient();
  if (!isClient) {
    return (
      <div className="my-2 grid max-h-96 w-full grid-cols-1 gap-2 rounded-xl border md:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }
  return (
    <SliderProvider>
      <CodeProvider>
        <Suspense
          fallback={
            <div className="my-2 grid max-h-96 w-full grid-cols-1 gap-2 rounded-xl border md:grid-cols-2">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          }
        >
          <div className="my-2 grid max-h-96 w-full grid-cols-1 gap-2 rounded-xl border md:grid-cols-2">
            <IDE />
            <NodePreview />
          </div>
        </Suspense>
      </CodeProvider>
    </SliderProvider>
  );
};
