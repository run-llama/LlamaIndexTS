"use client";

import { ChatSection as ChatSectionUI } from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { useChat } from "ai/react";
import { useEffect, useMemo, useState } from "react";
import Header from "./header";
import CustomChatInput from "./ui/chat/chat-input";
import CustomChatMessages from "./ui/chat/chat-messages";
import { fetchComponentDefinitions } from "./ui/chat/custom/events/loader";
import { ComponentDef } from "./ui/chat/custom/events/types";
import { getConfig } from "./ui/lib/utils";

export default function ChatSection() {
  const [componentDefs, setComponentDefs] = useState<ComponentDef[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const appendError = (error: string) => {
    setErrors((prev) => [...prev, error]);
  };

  const uniqueErrors = useMemo(() => {
    return Array.from(new Set(errors));
  }, [errors]);

  // fetch component definitions and use Babel to tranform JSX code to JS code
  // this is triggered only once when the page is initialised
  useEffect(() => {
    fetchComponentDefinitions().then(({ components, errors }) => {
      setComponentDefs(components);
      if (errors.length > 0) {
        setErrors((prev) => [...prev, ...errors]);
      }
    });
  }, []);

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
    <div className="flex h-[85vh] w-full flex-col gap-2">
      <Header />
      {uniqueErrors.length > 0 && (
        <div className="error-list">
          {uniqueErrors.map((error, index) => (
            <div key={index} className="error-item">
              <span>{error}</span>
              <button
                className="clear-error"
                onClick={() => {
                  setErrors((prev) => prev.filter((_, i) => i !== index));
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
      <ChatSectionUI handler={handler} className="min-h-0 w-full flex-1">
        <CustomChatMessages
          componentDefs={componentDefs}
          appendError={appendError}
        />
        <CustomChatInput />
      </ChatSectionUI>
    </div>
  );
}
