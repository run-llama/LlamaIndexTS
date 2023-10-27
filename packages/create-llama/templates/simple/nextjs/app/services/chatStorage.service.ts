import { ChatMessage } from "llamaindex";

export const CHAT_STORAGE_KEY = "chatHistory";

class _ChatStorageService {
  public getChatHistory(): ChatMessage[] {
    const chatHistory = localStorage.getItem(CHAT_STORAGE_KEY);
    return chatHistory ? JSON.parse(chatHistory) : [];
  }

  public saveChatHistory(chatHistory: ChatMessage[]) {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
  }

  public clearChatHistory() {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }

  public addChatMessage(chatMessage: ChatMessage) {
    const chatHistory = this.getChatHistory();
    chatHistory.push(chatMessage);
    this.saveChatHistory(chatHistory);
  }

  constructor() {
    if (typeof window !== "undefined") {
      const chatHistory = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!chatHistory) this.saveChatHistory([]);
    }
  }
}

const ChatStorageService = new _ChatStorageService();

export default ChatStorageService;
