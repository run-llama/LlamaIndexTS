"use client";

import {
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection as ChatSectionUI,
} from "@llamaindex/chat-ui";
import { useChatRSC } from "./use-chat-rsc";

export const ChatSectionRSC = () => {
  const handler = useChatRSC();
  return (
    <ChatSectionUI handler={handler}>
      <ChatMessages>
        <ChatMessages.List className="h-auto max-h-[400px]">
          {handler.messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isLast={index === handler.messages.length - 1}
            >
              <ChatMessage.Avatar />
              <ChatMessage.Content>{message.display}</ChatMessage.Content>
            </ChatMessage>
          ))}
          <ChatMessages.Loading />
        </ChatMessages.List>
      </ChatMessages>
      <ChatInput />
    </ChatSectionUI>
  );
};
