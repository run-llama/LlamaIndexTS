"use client";

import { CodeBlock } from "@llamaindex/chat-ui/widgets";
import { Check, Copy, Download, History, Loader2, X } from "lucide-react";
import React, { memo, useEffect, useState } from "react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import {
  CodeArtifact,
  DocumentArtifact,
  useChatCanvas,
} from "./chat-canvas-provider";
import { parseComponent } from "./custom/events/loader";
import { EventRenderComponent } from "./custom/events/types";
import { useCopyToClipboard } from "./hooks/use-copy-to-clipboard";
import { RenderingErrors } from "./rendering-errors";
export const ChatCanvas = memo(() => {
  const { displayedArtifact } = useChatCanvas();

  if (displayedArtifact?.type === "code") {
    return (
      <CanvasContainer>
        <CodeArtifactViewer artifact={displayedArtifact as CodeArtifact} />
      </CanvasContainer>
    );
  }

  if (displayedArtifact?.type === "document") {
    return (
      <CanvasContainer>
        <DocumentArtifactViewer
          artifact={displayedArtifact as DocumentArtifact}
        />
      </CanvasContainer>
    );
  }

  // TODO: display renderError inside Canvas also, this will help easier debugging custom event code

  return null;
});

function CanvasContainer({ children }: { children: React.ReactNode }) {
  const { isCanvasOpen } = useChatCanvas();

  if (!isCanvasOpen) return null;

  return (
    <div
      className="right-0 top-0 h-full w-2/3 shrink-0 overflow-auto border-l bg-white"
      style={{
        animation: isCanvasOpen
          ? "slideIn 0.3s ease-out forwards"
          : "slideOut 0.3s ease-out forwards",
      }}
    >
      <RenderingErrors />
      {children}
    </div>
  );
}

function CodeArtifactViewer({ artifact }: { artifact: CodeArtifact }) {
  const {
    data: { language, code, file_name },
  } = artifact;

  return (
    <Tabs defaultValue="code" className="flex h-full flex-col gap-4 p-4">
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
      <div className="min-h-0 flex-1">
        <TabsContent value="code" className="h-full">
          <CodeBlock language={language} value={code} showHeader={false} />
        </TabsContent>
        <TabsContent value="preview" className="h-full">
          <CodeArtifactPreview artifact={artifact} />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function CodeArtifactPreview({ artifact }: { artifact: CodeArtifact }) {
  const {
    data: { code, file_name },
  } = artifact;
  const [isRendering, setIsRendering] = useState(true);
  const [component, setComponent] = useState<EventRenderComponent | null>(null);

  useEffect(() => {
    const renderComponent = async () => {
      setIsRendering(true);
      const { component: parsedComponent } = await parseComponent(
        code,
        file_name,
      );

      // TODO: handle error when parsing component -> Display renderError

      if (parsedComponent) {
        setComponent(() => parsedComponent);
        setIsRendering(false);
      }
    };

    renderComponent();
  }, [code, file_name]);

  if (isRendering) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        <p className="text-sm text-gray-500">Rendering...</p>
      </div>
    );
  }

  if (!component) {
    return <div>Error rendering component</div>;
  }

  return <div>{React.createElement(component, { events: [] })}</div>;
}

function DocumentArtifactViewer({ artifact }: { artifact: DocumentArtifact }) {
  return <div>TODO</div>;
}

function ArtifactVersionHistory() {
  const { allArtifacts, openArtifactInCanvas } = useChatCanvas();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer rounded-full"
        >
          <History className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 text-xs" align="end">
        <h4 className="border-b p-2 px-3 font-semibold">Version History</h4>
        <div className="max-h-80 overflow-y-auto">
          {allArtifacts.map((artifact, index) => (
            <div
              key={index}
              className="text-muted-foreground cursor-pointer px-3 py-2 hover:bg-gray-100"
              onClick={() => openArtifactInCanvas(artifact)}
            >
              <div className="flex items-center justify-between">
                Version {artifact.version}{" "}
                {artifact.currentVersion && "(Current)"}
              </div>
            </div>
          ))}
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
