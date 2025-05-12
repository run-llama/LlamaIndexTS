import { Anthropic } from "@llamaindex/anthropic";

async function main() {
  const anthropic = new Anthropic({
    model: "claude-3-7-sonnet",
  });

  const entireBook = await fetch(
    "https://www.gutenberg.org/files/1342/1342-0.txt",
  ).then((response) => response.text());

  const response = await anthropic.chat({
    messages: [
      {
        content:
          "You are an AI assistant tasked with analyzing literary works. Your goal is to provide insightful commentary on themes, characters, and writing style.\n",
        role: "system",
      },
      {
        content: entireBook,
        role: "system",
        options: {
          cache_control: {
            type: "ephemeral",
          },
        },
      },
      {
        content: "analyze the major themes in Pride and Prejudice.",
        role: "user",
      },
    ],
  });

  console.log(response.message.content);
}

main().catch(console.error);
