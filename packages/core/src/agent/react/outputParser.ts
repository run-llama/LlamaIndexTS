import type { BaseReasoningStep } from "./types.js";
import {
  ActionReasoningStep,
  BaseOutputParser,
  ResponseReasoningStep,
} from "./types.js";

function extractJsonStr(text: string): string {
  const pattern = /\{.*\}/s;
  const match = text.match(pattern);

  if (!match) {
    throw new Error(`Could not extract json string from output: ${text}`);
  }

  return match[0];
}

function extractToolUse(inputText: string): [string, string, string] {
  const pattern =
    /\s*Thought: (.*?)\nAction: ([a-zA-Z0-9_]+).*?\nAction Input: .*?(\{.*?\})/s;

  const match = inputText.match(pattern);

  if (!match) {
    throw new Error(`Could not extract tool use from input text: ${inputText}`);
  }

  const thought = match[1].trim();
  const action = match[2].trim();
  const actionInput = match[3].trim();
  return [thought, action, actionInput];
}

function actionInputParser(jsonStr: string): object {
  const processedString = jsonStr.replace(/(?<!\w)\'|\'(?!\w)/g, '"');
  const pattern = /"(\w+)":\s*"([^"]*)"/g;
  const matches = [...processedString.matchAll(pattern)];
  return Object.fromEntries(matches);
}

function extractFinalResponse(inputText: string): [string, string] {
  const pattern = /\s*Thought:(.*?)Answer:(.*?)(?:$)/s;

  const match = inputText.match(pattern);

  if (!match) {
    throw new Error(
      `Could not extract final answer from input text: ${inputText}`,
    );
  }

  const thought = match[1].trim();
  const answer = match[2].trim();
  return [thought, answer];
}

export class ReActOutputParser extends BaseOutputParser {
  parse(output: string, isStreaming: boolean = false): BaseReasoningStep {
    if (!output.includes("Thought:")) {
      // NOTE: handle the case where the agent directly outputs the answer
      // instead of following the thought-answer format
      return new ResponseReasoningStep({
        thought: "(Implicit) I can answer without any more tools!",
        response: output,
        isStreaming,
      });
    }

    if (output.includes("Answer:")) {
      const [thought, answer] = extractFinalResponse(output);
      return new ResponseReasoningStep({
        thought: thought,
        response: answer,
        isStreaming,
      });
    }

    if (output.includes("Action:")) {
      const [thought, action, action_input] = extractToolUse(output);
      const json_str = extractJsonStr(action_input);

      // First we try json, if this fails we use ast
      let actionInputDict;

      try {
        actionInputDict = JSON.parse(json_str);
      } catch (e) {
        actionInputDict = actionInputParser(json_str);
      }

      return new ActionReasoningStep({
        thought: thought,
        action: action,
        actionInput: actionInputDict,
      });
    }

    throw new Error(`Could not parse output: ${output}`);
  }

  format(output: string): string {
    throw new Error("Not implemented");
  }
}
