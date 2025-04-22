"use client";

import { CodeBlock } from "@llamaindex/chat-ui/widgets";
import { Copy, Download, History, Loader2, X } from "lucide-react";
import React, { memo, useEffect, useState } from "react";
import { Button } from "../button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import {
  CodeArtifact,
  DocumentArtifact,
  useChatCanvas,
} from "./chat-canvas-provider";
import { parseComponent } from "./custom/events/loader";
import { EventRenderComponent } from "./custom/events/types";

export const ChatCanvas = memo(() => {
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

  // TODO: display renderError inside Canvas also, this will help easier debugging custom event code

  return null;
});

function CodeArtifactViewer({ artifact }: { artifact: CodeArtifact }) {
  const { closeCanvas, isCanvasOpen } = useChatCanvas();
  const {
    data: { language, code },
  } = artifact;

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
      <Tabs defaultValue="code" className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <History className="size-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Copy className="size-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={closeCanvas}>
              <X className="size-4" />
            </Button>
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
    </div>
  );
}

function CodeArtifactPreview({ artifact }: { artifact: CodeArtifact }) {
  const {
    data: { code, file_name },
  } = artifact;
  const [isRendering, setIsRendering] = useState(true);
  const [component, setComponent] = useState<EventRenderComponent | null>(null);

  useEffect(() => {
    let isMounted = true; // To handle cleanup for async operations

    const renderComponent = async () => {
      setIsRendering(true);
      const { component: parsedComponent } = await parseComponent(
        code,
        file_name,
      );

      // TODO: handle error when parsing component -> Display renderError

      if (isMounted && parsedComponent) {
        setComponent(() => parsedComponent);
        setIsRendering(false);
      } else if (isMounted) {
        setIsRendering(false);
      }
    };

    renderComponent();

    return () => {
      isMounted = false; // Cleanup to prevent state updates on unmounted component
    };
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
