"use client";

import { ChatSection as ChatSectionUI } from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { useChat } from "ai/react";
import { useEffect, useMemo, useState } from "react";
import Header from "./header";
import { RenderingErrors } from "./rendering-errors";
import CustomChatInput from "./ui/chat/chat-input";
import CustomChatMessages from "./ui/chat/chat-messages";
import { fetchComponentDefinitions } from "./ui/chat/custom/events/loader";
import { ComponentDef } from "./ui/chat/custom/events/types";
import { getConfig } from "./ui/lib/utils";

export default function ChatSection() {
  const [componentDefs, setComponentDefs] = useState<ComponentDef[]>([]);
  const [errors, setErrors] = useState<string[]>([]); // contain all errors when compiling with Babel and runtime

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
      <RenderingErrors
        uniqueErrors={uniqueErrors}
        clearErrors={() => setErrors([])}
      />
      <ChatSectionUI handler={handler} className="min-h-0 w-full flex-1">
        <CustomChatMessages
          componentDefs={componentDefs}
          appendError={appendError}
        />
        <CustomChatInput />
      </ChatSectionUI>
      <TailwindCDNInjection />
    </div>
  );
}

/**
 * The default border color has changed to `currentColor` in Tailwind CSS v4,
 * so adding these compatibility styles to make sure everything still
 * looks the same as it did with Tailwind CSS v3.
 */
const tailwindConfig = `
@import "tailwindcss";

@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}
`;

function TailwindCDNInjection() {
  if (!getConfig("COMPONENTS_API")) return null;
  return (
    <>
      <script
        async
        src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
      ></script>
      <style type="text/tailwindcss">{tailwindConfig}</style>
    </>
  );
}
