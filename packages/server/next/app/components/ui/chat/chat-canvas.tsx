/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { CodeBlock } from "@llamaindex/chat-ui/widgets";
import { Check, Copy, Download, History, Loader2, X } from "lucide-react";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Button } from "../button";
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
import { RenderingErrors } from "./rendering-errors";

export function ChatCanvas() {
  const { isCanvasOpen, displayedArtifact, uniqueErrors } = useChatCanvas();

  if (!isCanvasOpen) return null; // if canvas is closed, don't render the canvas
  if (!displayedArtifact && !uniqueErrors.length) return null; // if no artifact and no errors, don't render the canvas

  return (
    <div
      className="right-0 top-0 flex h-full w-3/5 shrink-0 flex-col border-l bg-white"
      style={{
        animation: isCanvasOpen
          ? "slideIn 0.3s ease-out forwards"
          : "slideOut 0.3s ease-out forwards",
      }}
    >
      {uniqueErrors.length > 0 && (
        <div className="p-4">
          <RenderingErrors />
        </div>
      )}
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

const SUPPORTED_LANGUAGES = ["js", "jsx", "ts", "tsx"];

function CodeArtifactViewer({ artifact }: { artifact: CodeArtifact }) {
  const {
    created_at,
    data: { language, code, file_name },
  } = artifact;

  return (
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

      if (parsedComponent) {
        setComponent(() => parsedComponent);
      }

      if (error) {
        appendErrors([error]);
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
    <DynamicComponentErrorBoundary onError={(error) => appendErrors([error])}>
      {React.createElement(component)}
    </DynamicComponentErrorBoundary>
  );
}

function DocumentArtifactViewer({ artifact }: { artifact: DocumentArtifact }) {
  return <div>TODO</div>;
}

function ArtifactVersionHistory() {
  const {
    allArtifacts,
    openArtifactInCanvas,
    displayedArtifact,
    getArtifactVersion,
  } = useChatCanvas();
  return (
    <Popover>
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
            return (
              <div
                key={index}
                className={cn(
                  "text-muted-foreground cursor-pointer px-3 py-2 hover:bg-gray-100",
                  isCurrent && "text-blue-500",
                )}
                onClick={() => openArtifactInCanvas(artifact)}
              >
                Version {getArtifactVersion(artifact).versionNumber}
                {isCurrent && <span className="ml-1">(Current)</span>}
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
