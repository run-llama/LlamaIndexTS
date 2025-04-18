"use client";

import { ChatSection as ChatSectionUI } from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { Message, useChat } from "ai/react";
import { Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RenderingErrors } from "./rendering-errors";
import { Button } from "./ui/button";
import CustomChatInput from "./ui/chat/chat-input";
import CustomChatMessages from "./ui/chat/chat-messages";
import { fetchComponentDefinitions } from "./ui/chat/custom/events/loader";
import { ComponentDef } from "./ui/chat/custom/events/types";
import { getConfig } from "./ui/lib/utils";

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Generate a logo for LlamaIndex",
    role: "user",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Got it! Here is the logo for LlamaIndex. The logo features a friendly llama mascot that represents our AI-powered document indexing and chat capabilities.",
    annotations: [
      {
        type: "image",
        data: {
          url: "/llama.png",
        },
      },
    ],
  },
  {
    id: "3",
    role: "user",
    content: "Show me a pdf file",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Got it! Here is a sample PDF file that demonstrates PDF handling capabilities. This PDF contains some basic text and formatting examples that you can use to test PDF viewing functionality.",
    annotations: [
      {
        type: "document_file",
        data: {
          files: [
            {
              id: "1",
              name: "sample.pdf",
              url: "https://pdfobject.com/pdf/sample.pdf",
            },
          ],
        },
      },
    ],
  },
  {
    id: "4",
    role: "user",
    content: "Show me a pdf file",
  },
  {
    id: "5",
    role: "assistant",
    content:
      "Got it! Here is a sample PDF file that demonstrates PDF handling capabilities. This PDF contains some basic text and formatting examples that you can use to test PDF viewing functionality.",
    annotations: [
      {
        type: "document_file",
        data: {
          files: [
            {
              id: "1",
              name: "sample.pdf",
              url: "https://pdfobject.com/pdf/sample.pdf",
            },
          ],
        },
      },
    ],
  },
];

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
    initialMessages,
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
      <div className="grid h-screen w-screen grid-cols-4 gap-4 overflow-hidden">
        <div className="col-span-1">
          <div className="flex flex-col gap-2 p-2 pl-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />
              <h1 className="font-semibold">{getConfig("APP_TITLE")}</h1>
            </div>

            <RenderingErrors
              uniqueErrors={uniqueErrors}
              clearErrors={() => setErrors([])}
            />
          </div>
        </div>
        <div className="col-span-2 h-full min-h-0">
          <ChatSectionUI handler={handler} className="p-0">
            <CustomChatMessages
              componentDefs={componentDefs}
              appendError={appendError}
            />
            <CustomChatInput />
          </ChatSectionUI>
        </div>
        <div className="col-span-1">
          <div className="flex items-center justify-end gap-4 p-2 pr-4">
            <div className="flex items-center gap-2">
              <a
                href="https://www.llamaindex.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Built by LlamaIndex
              </a>
              <img
                className="h-[24px] w-[24px] rounded-sm"
                src="/llama.png"
                alt="Llama Logo"
              />
            </div>
            <a
              href="https://github.com/run-llama/LlamaIndexTS"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Star className="mr-2 size-4" />
                Star on GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>
      <TailwindCDNInjection />
    </>
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
