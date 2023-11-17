"use client";

import { useChat } from "ai/react";
import { ChatInput, ChatMessages } from "./ui/chat";
import { useCallback, useState } from 'react'

export default function ChatSection() {
  // indicate if the chat is pending for response and no streaming is happening
  const [isPending, setIsPending] = useState(false);

  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
  } = useChat({ api: process.env.NEXT_PUBLIC_CHAT_API,
    onResponse: useCallback(() => {
      setIsPending(false);
    }, [])
  });

  const onSubmit = useCallback<typeof handleSubmit>((...args) => {
    setIsPending(true);
    return handleSubmit(...args);
  }, [handleSubmit])

  const onReload = useCallback<typeof reload>((...args) => {
    setIsPending(true);
    return reload(...args);
  }, [reload])

  const onStop = useCallback<typeof stop>((...args) => {
    setIsPending(false);
    return stop(...args);
  }, [stop])

  return (
    <div className="space-y-4 max-w-5xl w-full">
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        isPending={isPending}
        reload={onReload}
        stop={onStop}
      />
      <ChatInput
        input={input}
        handleSubmit={onSubmit}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
      />
    </div>
  );
}
