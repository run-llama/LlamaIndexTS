"use client";

import { CodeArtifact, useChatCanvas } from "@llamaindex/chat-ui";
import { Loader2, WandSparkles } from "lucide-react";
import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../accordion";
import { buttonVariants } from "../../button";
import { cn } from "../../lib/utils";
import { DynamicComponentErrorBoundary } from "../custom/events/error-boundary";
import { parseComponent } from "../custom/events/loader";

const SUPPORTED_FRONTEND_PREVIEW = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "javascript",
  "typescript",
];

export function CodeArtifactRenderer() {
  const { displayedArtifact } = useChatCanvas();

  if (displayedArtifact?.type !== "code") return null;
  const codeArtifact = displayedArtifact as CodeArtifact;

  if (!SUPPORTED_FRONTEND_PREVIEW.includes(codeArtifact.data.language)) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <p className="text-sm text-gray-500">
          Preview is not supported for this language
        </p>
      </div>
    );
  }

  return <CodeArtifactRendererComp artifact={codeArtifact} />;
}

function CodeArtifactRendererComp({ artifact }: { artifact: CodeArtifact }) {
  const { appendErrors } = useChatCanvas();
  const [isRendering, setIsRendering] = useState(true);
  const [component, setComponent] = useState<FunctionComponent | null>(null);

  const {
    data: { code, file_name },
  } = artifact;

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
  }, [artifact]);

  if (isRendering) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        <p className="text-sm text-gray-500">Rendering Artifact...</p>
      </div>
    );
  }

  if (!component) {
    return <CodeErrors artifact={artifact} />;
  }

  return (
    <DynamicComponentErrorBoundary
      onError={(error) => appendErrors(artifact, [error])}
    >
      {React.createElement(component)}
    </DynamicComponentErrorBoundary>
  );
}

function CodeErrors({ artifact }: { artifact: CodeArtifact }) {
  const { getCodeErrors, fixCodeErrors } = useChatCanvas();
  const uniqueErrors = getCodeErrors(artifact);

  if (uniqueErrors.length === 0) return null;

  return (
    <div className="flex flex-col gap-10 px-10 pt-10">
      <p className="text-center text-sm text-gray-500">
        Error when rendering code, please check the details and try fixing them.
      </p>
      <Accordion
        type="single"
        defaultValue="errors"
        collapsible
        className="w-full rounded-xl border border-gray-100 bg-white shadow-md"
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
                    "mr-2 h-8 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    fixCodeErrors(artifact);
                  }}
                >
                  <WandSparkles className="mr-2 h-4 w-4" />
                  <span>Fix errors</span>
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
    </div>
  );
}
