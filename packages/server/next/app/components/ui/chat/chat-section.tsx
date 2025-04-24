"use client";

import { ChatCanvas, ChatSection as ChatUI } from "@llamaindex/chat-ui";
import { useChat } from "ai/react";
import { useEffect, useMemo, useState } from "react";
import { getConfig } from "../lib/utils";
import { ChatHeader } from "./chat-header";
import { ChatInjection } from "./chat-injection";
import CustomChatInput from "./chat-input";
import CustomChatMessages from "./chat-messages";
import { FrontendPreview } from "./custom/artifact-playground";
import { DynamicEventsErrors } from "./custom/events/dynamic-events-errors";
import { fetchComponentDefinitions } from "./custom/events/loader";
import { ComponentDef } from "./custom/events/types";

export default function ChatSection() {
  const handler = useChat({
    api: getConfig("CHAT_API"),
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      let errorMessage: string;
      try {
        errorMessage = JSON.parse(error.message).detail;
      } catch (e) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    },
    experimental_throttle: 100,
  });
  return (
    <>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <ChatHeader />
        <ChatUI
          handler={handler}
          className="flex min-h-0 flex-1 flex-row justify-center gap-4 px-4 py-0"
        >
          <CustomChatSection />
          <ChatCanvas>
            <ChatCanvas.CodeArtifact tabs={{ preview: <FrontendPreview /> }} />
            <ChatCanvas.DocumentArtifact />
          </ChatCanvas>
        </ChatUI>
      </div>
      <ChatInjection />
    </>
  );
}

function CustomChatSection() {
  const [componentDefs, setComponentDefs] = useState<ComponentDef[]>([]);
  const [dynamicEventsErrors, setDynamicEventsErrors] = useState<string[]>([]); // contain all errors when rendering dynamic events from componentDir

  const appendError = (error: string) => {
    setDynamicEventsErrors((prev) => [...prev, error]);
  };

  const uniqueErrors = useMemo(() => {
    return Array.from(new Set(dynamicEventsErrors));
  }, [dynamicEventsErrors]);

  // fetch component definitions and use Babel to tranform JSX code to JS code
  // this is triggered only once when the page is initialised
  useEffect(() => {
    fetchComponentDefinitions().then(({ components, errors }) => {
      setComponentDefs(components);
      if (errors.length > 0) {
        setDynamicEventsErrors((prev) => [...prev, ...errors]);
      }
    });
  }, []);

  return (
    <div className="max-w-1/2 flex h-full min-w-0 flex-1 flex-col gap-4">
      <DynamicEventsErrors
        errors={uniqueErrors}
        clearErrors={() => setDynamicEventsErrors([])}
      />
      <CustomChatMessages
        componentDefs={componentDefs}
        appendError={appendError}
      />
      <CustomChatInput />
    </div>
  );
}
