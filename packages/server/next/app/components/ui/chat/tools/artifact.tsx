"use client";

import { Check, ChevronDown, Code, Copy, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "../../button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../collapsible";
import { cn } from "../../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Markdown } from "../custom/markdown";
import { useClientConfig } from "../hooks/use-config";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";

// detail information to execute code
export type CodeArtifact = {
  commentary: string;
  template: string;
  title: string;
  description: string;
  additional_dependencies: string[];
  has_additional_dependencies: boolean;
  install_dependencies_command: string;
  port: number | null;
  file_path: string;
  code: string;
  files?: string[];
};

type OutputUrl = {
  url: string;
  filename: string;
};

type ArtifactResult = {
  template: string;
  stdout: string[];
  stderr: string[];
  runtimeError?: { name: string; value: string; tracebackRaw: string[] };
  outputUrls: OutputUrl[];
  url: string;
};

export function Artifact({
  artifact,
  version,
}: {
  artifact: CodeArtifact | null;
  version?: number;
}) {
  const [result, setResult] = useState<ArtifactResult | null>(null);
  const [sandboxCreationError, setSandboxCreationError] = useState<string>();
  const [sandboxCreating, setSandboxCreating] = useState(false);
  const [openOutputPanel, setOpenOutputPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { backend } = useClientConfig();

  const handleOpenOutput = async () => {
    setOpenOutputPanel(true);
    openPanel();
    panelRef.current?.classList.remove("hidden");
  };

  const fetchArtifactResult = async () => {
    try {
      setSandboxCreating(true);

      const response = await fetch(`${backend}/api/sandbox`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ artifact }),
      });

      if (!response.ok) {
        throw new Error("Failure running code artifact");
      }

      const fetchedResult = await response.json();

      setResult(fetchedResult);
    } catch (error) {
      console.error("Error fetching artifact result:", error);
      setSandboxCreationError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred when executing code",
      );
    } finally {
      setSandboxCreating(false);
    }
  };

  useEffect(() => {
    // auto trigger code execution
    !result && fetchArtifactResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!artifact || version === undefined) return null;

  return (
    <div>
      <div
        onClick={handleOpenOutput}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-auto cursor-pointer px-6 py-3 w-full flex gap-4 items-center justify-start border border-gray-200 rounded-md",
        )}
      >
        <Code className="h-6 w-6" />
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold m-0">
            {artifact.title} v{version}
          </h4>
          <span className="text-xs text-gray-500">Click to open code</span>
        </div>
      </div>

      {openOutputPanel && (
        <div
          className="w-[45vw] fixed top-0 right-0 h-screen z-50 artifact-panel animate-slideIn"
          ref={panelRef}
        >
          <div className="flex justify-between items-center pl-5 pr-10 py-6 border-b">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold m-0">{artifact?.title}</h2>
              <span className="text-sm text-gray-500">Version: v{version}</span>
            </div>
            <Button
              onClick={() => {
                closePanel();
                setOpenOutputPanel(false);
              }}
              variant="outline"
            >
              Close
            </Button>
          </div>

          {sandboxCreating && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {sandboxCreationError && (
            <div className="p-4 bg-red-100 text-red-800 rounded-md m-4">
              <h3 className="font-bold mb-2 mt-0">
                Error when creating Sandbox:
              </h3>
              <p className="font-semibold">{sandboxCreationError}</p>
            </div>
          )}
          {result && (
            <ArtifactOutput
              artifact={artifact}
              result={result}
              version={version}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ArtifactOutput({
  artifact,
  result,
  version,
}: {
  artifact: CodeArtifact;
  result: ArtifactResult;
  version: number;
}) {
  const fileExtension = artifact.file_path.split(".").pop() || "";
  const markdownCode = `\`\`\`${fileExtension}\n${artifact.code}\n\`\`\``;
  const { url: sandboxUrl, outputUrls, runtimeError, stderr, stdout } = result;

  return (
    <Tabs defaultValue="code" className="h-full p-4 overflow-auto">
      <TabsList className="grid grid-cols-2 max-w-[400px] mx-auto">
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="code" className="h-[80%] mb-4 overflow-auto">
        <div className="m-4 overflow-auto">
          <Markdown content={markdownCode} />
        </div>
      </TabsContent>
      <TabsContent
        value="preview"
        className="h-[80%] mb-4 overflow-auto mt-4 space-y-4"
      >
        {runtimeError && <RunTimeError runtimeError={runtimeError} />}
        <ArtifactLogs stderr={stderr} stdout={stdout} />
        {sandboxUrl && <CodeSandboxPreview url={sandboxUrl} />}
        {outputUrls && <InterpreterOutput outputUrls={outputUrls} />}
      </TabsContent>
    </Tabs>
  );
}

function RunTimeError({
  runtimeError,
}: {
  runtimeError: { name: string; value: string; tracebackRaw?: string[] };
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1000 });
  const contentToCopy = `Fix this error:\n${runtimeError.name}\n${runtimeError.value}\n${runtimeError.tracebackRaw?.join("\n")}`;
  return (
    <Collapsible className="bg-red-100 text-red-800 rounded-md py-2 px-4 space-y-4">
      <CollapsibleTrigger className="font-bold w-full text-start flex items-center justify-between">
        <span>Runtime Error:</span>
        <ChevronDown className="w-4 h-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="text-sm flex gap-2">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{runtimeError.name}</p>
          <p>{runtimeError.value}</p>
          {runtimeError.tracebackRaw?.map((trace, index) => (
            <pre key={index} className="whitespace-pre-wrap text-sm mb-2">
              {trace}
            </pre>
          ))}
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(contentToCopy);
          }}
          size="icon"
          variant="ghost"
          className="h-12 w-12 shrink-0"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CodeSandboxPreview({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!loading && iframeRef.current) {
      iframeRef.current.focus();
    }
  }, [loading]);

  return (
    <>
      <iframe
        key={url}
        ref={iframeRef}
        className="h-full w-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={url}
        onLoad={() => setLoading(false)}
      />
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}
    </>
  );
}

function InterpreterOutput({ outputUrls }: { outputUrls: OutputUrl[] }) {
  return (
    <ul className="flex flex-col gap-2 mt-4">
      {outputUrls.map((url) => (
        <li key={url.url}>
          <div className="mt-4">
            {isImageFile(url.filename) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url.url} alt={url.filename} className="my-4 w-1/2" />
            ) : (
              <a
                href={url.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {url.filename}
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ArtifactLogs({
  stderr,
  stdout,
}: {
  stderr?: string[];
  stdout?: string[];
}) {
  if (!stderr?.length && !stdout?.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {stdout && stdout.length > 0 && (
        <Collapsible className="bg-green-100 text-green-800 rounded-md py-2 px-4 space-y-4">
          <CollapsibleTrigger className="font-bold w-full text-start flex items-center justify-between">
            <span>Output log:</span>
            <ChevronDown className="w-4 h-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="text-sm">
            <ArtifactLogItems logs={stdout} />
          </CollapsibleContent>
        </Collapsible>
      )}
      {stderr && stderr.length > 0 && (
        <Collapsible className="bg-yellow-100 text-yellow-800 rounded-md py-2 px-4 space-y-4">
          <CollapsibleTrigger className="font-bold w-full text-start flex items-center justify-between">
            <span>Error log:</span>
            <ChevronDown className="w-4 h-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="text-sm">
            <ArtifactLogItems logs={stderr} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function ArtifactLogItems({ logs }: { logs: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {logs.map((log, index) => (
        <li key={index}>
          <pre className="whitespace-pre-wrap text-sm">{log}</pre>
        </li>
      ))}
    </ul>
  );
}

function isImageFile(filename: string): boolean {
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

// this is just a hack to handle the layout when opening or closing the output panel
// for real world application, you should use a global state management to control layout
function openPanel() {
  // hide all current artifact panel
  const artifactPanels = document.querySelectorAll(".artifact-panel");
  artifactPanels.forEach((panel) => {
    panel.classList.add("hidden");
  });

  // make the main div width smaller to have space for the output panel
  const mainDiv = document.querySelector("main");
  mainDiv?.classList.remove("w-screen");
  mainDiv?.classList.add("w-[55vw]");
  mainDiv?.classList.add("px-8");
}

function closePanel() {
  // reset the main div width
  const mainDiv = document.querySelector("main");
  mainDiv?.classList.remove("w-[55vw]");
  mainDiv?.classList.remove("px-8");
  mainDiv?.classList.add("w-screen");

  // hide all current artifact panel
  const artifactPanels = document.querySelectorAll(".artifact-panel");
  artifactPanels.forEach((panel) => {
    panel.classList.add("hidden");
  });
}
