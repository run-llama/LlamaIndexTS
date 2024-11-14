"use client";

import {
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection as ChatSectionUI,
} from "@llamaindex/chat-ui";
import { AI } from "./ai-action";
import { useChatRSC } from "./use-chat-rsc";

const ChatSectionRSC = () => {
  const handler = useChatRSC();
  return (
    <ChatSectionUI handler={handler} className="w-full h-full">
      <ChatMessages className="shadow-xl rounded-xl">
        <ChatMessages.List>
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

export const ChatDemo = () => (
  <AI>
    <ChatSectionRSC />
  </AI>
);
