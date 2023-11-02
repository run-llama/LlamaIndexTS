import * as React from "react";

import { Button } from "../button";
import { Input } from "../input";

export interface ChatInputProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  input: string;
  isLoading: boolean;
}

export default function ChatInput(props: ChatInputProps) {
  return (
    <form
      onSubmit={props.handleSubmit}
      className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4 rounded-xl bg-white p-4 shadow-xl"
    >
      <Input
        autoFocus
        name="message"
        placeholder="Type a message"
        className="flex-1"
        value={props.input}
        onChange={props.handleInputChange}
      />
      <Button disabled={props.isLoading} type="submit">
        Send message
      </Button>
    </form>
  );
}
