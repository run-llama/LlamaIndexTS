"use client";

import ChatHistory from "@/app/components/chat-history";
import MessageForm from "@/app/components/message-form";
import ChatStorageService from "@/app/services/chatStorage.service";
import { ChatMessage } from "llamaindex";
import { createContext, useContext, useEffect, useState } from "react";

const ChatSectionContext = createContext<{
  chatHistory: ChatMessage[];
  loadChat: () => void;
}>({
  chatHistory: [],
  loadChat: () => {},
});

const ChatSectionContextProvider = (props: { children: JSX.Element[] }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const loadChat = () => {
    const data = ChatStorageService.getChatHistory();
    setChatHistory(data);
  };

  useEffect(() => {
    loadChat();
  }, []);

  return (
    <ChatSectionContext.Provider value={{ chatHistory, loadChat }}>
      {props.children}
    </ChatSectionContext.Provider>
  );
};

export default function ChatSection() {
  return (
    <ChatSectionContextProvider>
      <ChatHistory />
      <MessageForm />
    </ChatSectionContextProvider>
  );
}

export const useChat = () => useContext(ChatSectionContext);
