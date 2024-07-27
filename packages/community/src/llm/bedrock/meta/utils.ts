import type {
  BaseTool,
  ChatMessage,
  MessageContentTextDetail,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import type { MetaMessage } from "./types";

const getToolCallInstructionString = (tool: BaseTool): string => {
  return `Use the function '${tool.metadata.name}' to '${tool.metadata.description}'`;
};

const getToolCallParametersString = (tool: BaseTool): string => {
  return JSON.stringify({
    name: tool.metadata.name,
    description: tool.metadata.description,
    parameters: tool.metadata.parameters
      ? Object.entries(tool.metadata.parameters.properties).map(
          ([name, definition]) => ({ [name]: definition }),
        )
      : {},
  });
};

// ported from https://github.com/meta-llama/llama-agentic-system/blob/main/llama_agentic_system/system_prompt.py
// NOTE: using json instead of the above xml style tool calling works more reliability
export const getToolsPrompt = (tools?: BaseTool[]) => {
  if (!tools?.length) return "";

  const customToolParams = tools.map((tool) => {
    return [
      getToolCallInstructionString(tool),
      getToolCallParametersString(tool),
    ].join("\n\n");
  });

  return `
Environment: node

# Tool Instructions
- Never use ipython, always use javascript in node

Cutting Knowledge Date: December 2023
Today Date: ${new Date().toLocaleString("en-US", { year: "numeric", month: "long" })} 

You have access to the following functions:

${customToolParams}

Think very carefully before calling functions.

If a you choose to call a function ONLY reply in the following json format:
{
  "name": function_name,
  "parameters": parameters,
}
where

{
  "name": function_name,
  "parameters": parameters, => a JSON dict with the function argument name as key and function argument value as value.
}

Here is an example,

{
  "name": "example_function_name",
  "parameters": {"example_name": "example_value"}
}

Reminder:
- Function calls MUST follow the specified format
- Required parameters MUST be specified
- Only call one function at a time
- Put the entire function call reply on one line
- Always add your sources when using search results to answer the user query
  `;
};

export const mapChatRoleToMetaRole = (
  role: ChatMessage["role"],
): MetaMessage["role"] => {
  if (role === "assistant") return "assistant";
  if (role === "user") return "user";
  return "system";
};

export const mapChatMessagesToMetaMessages = <
  T extends ChatMessage<ToolCallLLMMessageOptions>,
>(
  messages: T[],
): MetaMessage[] => {
  return messages.flatMap((msg) => {
    if (msg.options && "toolCall" in msg.options) {
      return msg.options.toolCall.map((call) => ({
        role: "assistant",
        content: JSON.stringify({
          id: call.id,
          name: call.name,
          parameters: call.input,
        }),
      }));
    }

    if (msg.options && "toolResult" in msg.options) {
      return {
        role: "ipython",
        content: JSON.stringify(msg.options.toolResult),
      };
    }

    let content: string = "";
    if (typeof msg.content === "string") {
      content = msg.content;
    } else if (msg.content.length) {
      content = (msg.content[0] as MessageContentTextDetail).text;
    }
    return {
      role: mapChatRoleToMetaRole(msg.role),
      content,
    };
  });
};

/**
 * Documentation at https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-3
 */
export const mapChatMessagesToMetaLlama3Messages = <T extends ChatMessage>(
  messages: T[],
  tools?: BaseTool[],
): string => {
  const parts: string[] = [];
  if (tools?.length) {
    parts.push(
      "<|begin_of_text|>",
      "<|start_header_id|>system<|end_header_id|>",
      getToolsPrompt(tools),
      "<|eot_id|>",
    );
  }

  const mapped = mapChatMessagesToMetaMessages(messages).map((message) => {
    return [
      "<|start_header_id|>",
      message.role,
      "<|end_header_id|>",
      message.content,
      "<|eot_id|>",
    ].join("\n");
  });

  parts.push(
    "<|begin_of_text|>",
    ...mapped,
    "<|start_header_id|>assistant<|end_header_id|>",
  );
  return parts.join("\n");
};

/**
 * Documentation at https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-2
 */
export const mapChatMessagesToMetaLlama2Messages = <T extends ChatMessage>(
  messages: T[],
): string => {
  const mapped = mapChatMessagesToMetaMessages(messages);
  let output = "<s>";
  let insideInst = false;
  let needsStartAgain = false;
  for (const message of mapped) {
    if (needsStartAgain) {
      output += "<s>";
      needsStartAgain = false;
    }
    const text = message.content;
    if (message.role === "system") {
      if (!insideInst) {
        output += "[INST] ";
        insideInst = true;
      }
      output += `<<SYS>>\n${text}\n<</SYS>>\n`;
    } else if (message.role === "user") {
      output += text;
      if (insideInst) {
        output += " [/INST]";
        insideInst = false;
      }
    } else if (message.role === "assistant") {
      if (insideInst) {
        output += " [/INST]";
        insideInst = false;
      }
      output += ` ${text} </s>\n`;
      needsStartAgain = true;
    }
  }
  return output;
};
