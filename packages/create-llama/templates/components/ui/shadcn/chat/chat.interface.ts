export interface Message {
  id: string;
  content: string;
  role: string;
}

export interface ChatHandler {
  messages: Message[];
  input: string;
  // loading indicates that the chat is continuing to update
  isLoading: boolean;
  // pending indicates that the chat is waiting for a response from the server
  isPending: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reload?: () => void;
  stop?: () => void;
}
