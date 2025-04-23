/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { CodeBlock, Markdown } from "@llamaindex/chat-ui/widgets";
import {
  Check,
  Copy,
  Download,
  FileText,
  History,
  Loader2,
  WandSparkles,
  X,
  XIcon,
} from "lucide-react";
import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";
import { Badge } from "../badge";
import { Button, buttonVariants } from "../button";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import {
  CodeArtifact,
  DocumentArtifact,
  isEqualArtifact,
  useChatCanvas,
} from "./chat-canvas-provider";
import { DynamicComponentErrorBoundary } from "./custom/events/error-boundary";
import { parseComponent } from "./custom/events/loader";
import { useCopyToClipboard } from "./hooks/use-copy-to-clipboard";

export function ChatCanvas() {
  const { isCanvasOpen, displayedArtifact } = useChatCanvas();

  if (!isCanvasOpen || !displayedArtifact) return null;

  return (
    <div
      className="right-0 top-0 flex h-full w-3/5 shrink-0 flex-col border-l bg-white"
      style={{
        animation: isCanvasOpen
          ? "slideIn 0.3s ease-out forwards"
          : "slideOut 0.3s ease-out forwards",
      }}
    >
      <ArtifactViewer />
    </div>
  );
}

function ArtifactViewer() {
  const { displayedArtifact } = useChatCanvas();

  if (displayedArtifact?.type === "code") {
    return <CodeArtifactViewer artifact={displayedArtifact as CodeArtifact} />;
  }

  if (displayedArtifact?.type === "document") {
    return (
      <DocumentArtifactViewer
        artifact={displayedArtifact as DocumentArtifact}
      />
    );
  }

  return null;
}

const SUPPORTED_LANGUAGES = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "javascript",
  "typescript",
];

function CodeArtifactViewer({ artifact }: { artifact: CodeArtifact }) {
  const {
    created_at,
    data: { language, code, file_name },
  } = artifact;

  return (
    <>
      <CodeArtifactErrors artifact={artifact} />
      <Tabs
        defaultValue="preview"
        className="flex h-full min-h-0 flex-1 flex-col gap-4 p-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <ArtifactVersionHistory />
            <ArtifactContentCopy content={code} />
            <ArtifactDownloadButton content={code} fileName={file_name} />
            <CanvasCloseButton />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto pr-2">
          <TabsContent value="code" className="h-full">
            <CodeBlock
              key={created_at} // make the code block re-highlight when changing artifact
              language={language}
              value={code}
              showHeader={false}
            />
          </TabsContent>
          <TabsContent value="preview" className="h-full">
            {SUPPORTED_LANGUAGES.includes(language) ? (
              <CodeArtifactPreview artifact={artifact} />
            ) : (
              <div className="flex h-full items-center justify-center gap-2">
                <p className="text-sm text-gray-500">
                  Preview is not supported for this language
                </p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}

function CodeArtifactPreview({ artifact }: { artifact: CodeArtifact }) {
  const {
    data: { code, file_name },
  } = artifact;
  const { appendErrors } = useChatCanvas();
  const [isRendering, setIsRendering] = useState(true);
  const [component, setComponent] = useState<FunctionComponent<any> | null>(
    null,
  );

  useEffect(() => {
    const renderComponent = async () => {
      setIsRendering(true);
      const { component: parsedComponent, error } = await parseComponent(
        code,
        file_name,
      );

      if (error) {
        setComponent(null);
        appendErrors(artifact, [error]);
      } else {
        setComponent(() => parsedComponent);
      }

      setIsRendering(false);
    };

    renderComponent();
  }, [code, file_name]);

  if (isRendering) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        <p className="text-sm text-gray-500">Rendering Artifact...</p>
      </div>
    );
  }

  if (!component) {
    // TODO: show a button to append errors to chat input
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <p className="text-sm text-gray-500">
          Error when rendering code, please check the details and try again.
        </p>
      </div>
    );
  }

  return (
    <DynamicComponentErrorBoundary
      onError={(error) => appendErrors(artifact, [error])}
    >
      {React.createElement(component)}
    </DynamicComponentErrorBoundary>
  );
}

const SUPPORTED_DOCUMENT_TYPES = ["markdown", "md", "mdx"];

function DocumentArtifactViewer({ artifact }: { artifact: DocumentArtifact }) {
  const {
    data: { content, title, type },
  } = artifact;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="flex items-center gap-3 text-gray-600">
          <FileText className="size-8 text-blue-500" />
          <div className="flex flex-col">
            <div className="text font-semibold">{title}</div>
            <div className="text-xs text-gray-500">{type}</div>
          </div>
        </h3>
        <div className="flex items-center gap-1">
          <ArtifactVersionHistory />
          <ArtifactContentCopy content={content} />
          <ArtifactDownloadButton content={content} fileName={title} />
          <CanvasCloseButton />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-stretch gap-4 overflow-auto px-20 py-4">
        {SUPPORTED_DOCUMENT_TYPES.includes(type) ? (
          <Markdown content={content} />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-gray-600">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}

function ArtifactVersionHistory() {
  const {
    allArtifacts,
    openArtifactInCanvas,
    displayedArtifact,
    getArtifactVersion,
    restoreArtifact,
  } = useChatCanvas();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="h-8 cursor-pointer rounded-full text-xs"
        >
          <History className="mr-1 size-4" />
          {displayedArtifact && (
            <>Version {getArtifactVersion(displayedArtifact).versionNumber}</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 text-xs" align="end">
        <h4 className="border-b p-2 px-3 font-semibold">Version History</h4>
        <div className="max-h-80 overflow-y-auto">
          {allArtifacts.map((artifact, index) => {
            const isCurrent =
              displayedArtifact && isEqualArtifact(artifact, displayedArtifact);
            const { versionNumber, isLatest } = getArtifactVersion(artifact);
            return (
              <div
                key={index}
                className="text-muted-foreground flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  openArtifactInCanvas(artifact);
                  setIsOpen(false);
                }}
              >
                <span className={cn(isCurrent && "text-blue-500")}>
                  Version {versionNumber}
                </span>
                {isLatest ? (
                  <Badge className="h-6 w-[70px] justify-center bg-blue-500 text-center hover:bg-blue-600">
                    Latest
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-[70px] shrink-0 cursor-pointer rounded-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreArtifact(artifact);
                      setIsOpen(false);
                    }}
                  >
                    Restore
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ArtifactContentCopy({ content }: { content: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1000 });

  const handleCopy = () => {
    if (isCopied) return;
    copyToClipboard(content);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer rounded-full"
      onClick={handleCopy}
    >
      {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}

function ArtifactDownloadButton({
  content,
  fileName,
}: {
  content: string;
  fileName: string;
}) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer rounded-full"
      onClick={handleDownload}
    >
      <Download className="size-4" />
    </Button>
  );
}

function CanvasCloseButton() {
  const { closeCanvas } = useChatCanvas();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer rounded-full"
      onClick={closeCanvas}
    >
      <X className="size-4" />
    </Button>
  );
}

// Show errors for a code artifact and actions to fix them
function CodeArtifactErrors({ artifact }: { artifact: CodeArtifact }) {
  const { getCodeErrors, clearCodeErrors, fixCodeErrors } = useChatCanvas();
  const uniqueErrors = getCodeErrors(artifact);

  if (uniqueErrors.length === 0) return null;

  return (
    <Accordion
      type="single"
      defaultValue="errors"
      collapsible
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-md"
    >
      <AccordionItem value="errors" className="border-none px-4">
        <AccordionTrigger className="py-2 hover:no-underline">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-bold">
                Rendering errors
              </span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs text-white">
                {uniqueErrors.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  fixCodeErrors(artifact);
                }}
              >
                <WandSparkles className="mr-2 h-4 w-4" />
                <span>Fix errors</span>
              </div>
              <div
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  clearCodeErrors(artifact);
                }}
              >
                <XIcon className="mr-2 h-4 w-4" />
                <span>Clear all</span>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-2">
            {uniqueErrors.map((error, index) => (
              <p key={index} className="text-muted-foreground text-sm">
                {error}
              </p>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
