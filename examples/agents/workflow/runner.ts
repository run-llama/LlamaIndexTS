import { openai } from "@llamaindex/openai";

import {
  agentStreamEvent,
  startAgentEvent,
  stopAgentEvent,
} from "@llamaindex/workflow";

import {
  artifactEvent,
  createDocumentArtifactWorkflow,
  uiEvent,
} from "./doc-workflow";

const llm = openai({ model: "gpt-4.1-mini" });

async function main() {
  const workflow = createDocumentArtifactWorkflow(llm, [], undefined);
  const { stream, sendEvent } = workflow.createContext();
  sendEvent(
    startAgentEvent.with({ userInput: "Create a project guideline document." }),
  );

  for await (const event of stream.until(stopAgentEvent)) {
    if (agentStreamEvent.include(event)) {
      process.stdout.write(event.data.delta);
    } else if (uiEvent.include(event)) {
      renderUIEvent(event.data.data);
    } else if (artifactEvent.include(event)) {
      console.log(event.data);
    }
  }
}

function renderUIEvent(eventData: UIEvent["data"]) {
  // Helper function to wrap text to a given width
  function wrapText(text: string | undefined, maxWidth: number): string[] {
    if (!text) return [""];
    if (maxWidth <= 0) return [text]; // Avoid issues with zero or negative max width

    const lines: string[] = [];
    const paragraphs = text.split("\n"); // Handle existing newlines

    for (const paragraph of paragraphs) {
      const words = paragraph.split(" "); // Changed let to const
      let currentLine = "";
      for (const word of words) {
        // If a single word is longer than maxWidth, it needs to be broken.
        if (word.length > maxWidth) {
          if (currentLine !== "") {
            // Push whatever is in currentLine first
            lines.push(currentLine);
            currentLine = "";
          }
          // Break the long word
          for (let i = 0; i < word.length; i += maxWidth) {
            lines.push(word.substring(i, i + maxWidth));
          }
        } else {
          // Standard word wrapping
          if ((currentLine + word).length + (currentLine ? 1 : 0) <= maxWidth) {
            currentLine += (currentLine ? " " : "") + word;
          } else {
            lines.push(currentLine);
            currentLine = word; // This new word is guaranteed to be <= maxWidth here
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }
    return lines.length > 0 ? lines : [""]; // Ensure at least one line (empty if text was empty)
  }

  const contentWidth = 60; // Define content width for text area inside borders
  const stateColorMap = {
    plan: "\x1b[33m", // Yellow
    generate: "\x1b[34m", // Blue
    completed: "\x1b[32m", // Green
  };
  const resetColor = "\x1b[0m";

  const state = eventData.state;
  const coloredState = `${stateColorMap[state]}${state.toUpperCase()}${resetColor}`;

  // Box drawing characters
  const horizontalLine = "─".repeat(contentWidth + 2); // +2 for padding spaces around content
  const topBorder = `┌${horizontalLine}┐`;
  const bottomBorder = `└${horizontalLine}┘`;
  const midSeparator = `├${horizontalLine}┤`;

  console.log(`\n${topBorder}`);

  // Center the title "💡 Workflow Event"
  const title = "💡 Workflow Event";
  // Calculate padding for centering the title
  const titleVisibleLength = title.length; // Assuming title has no ANSI codes
  const titlePaddingTotal = Math.max(0, contentWidth - titleVisibleLength);
  const titleLeftPadding = " ".repeat(Math.floor(titlePaddingTotal / 2));
  const titleRightPadding = " ".repeat(Math.ceil(titlePaddingTotal / 2));
  console.log(`│ ${titleLeftPadding}${title}${titleRightPadding} │`);

  console.log(midSeparator);

  // State line
  const stateLabel = "State: ";
  const visibleStateText = state.toUpperCase();
  const stateLineVisibleLength = stateLabel.length + visibleStateText.length;
  const statePadding = " ".repeat(
    Math.max(0, contentWidth - stateLineVisibleLength),
  );
  console.log(`│ ${stateLabel}${coloredState}${statePadding} │`);

  // Requirement section
  if (eventData.requirement !== undefined) {
    // Check if requirement key exists
    const requirementLabel = "Requirement: ";
    const requirementTextMaxWidth = contentWidth - requirementLabel.length;
    const requirementLines = wrapText(
      eventData.requirement,
      requirementTextMaxWidth,
    );

    if (
      requirementLines.length > 0 &&
      !(requirementLines.length === 1 && requirementLines[0] === "")
    ) {
      // First line with label
      console.log(
        `│ ${requirementLabel}${requirementLines[0].padEnd(requirementTextMaxWidth, " ")} │`,
      );
      // Subsequent lines, indented under the requirement text part
      for (let i = 1; i < requirementLines.length; i++) {
        console.log(
          `│ ${" ".repeat(requirementLabel.length)}${requirementLines[i].padEnd(requirementTextMaxWidth, " ")} │`,
        );
      }
    } else {
      // Requirement is present but empty, or only contains empty strings after wrapping
      console.log(
        `│ ${requirementLabel}${" ".repeat(requirementTextMaxWidth)} │`,
      );
    }
  }
  console.log(`${bottomBorder}\n`);
}

main().catch(console.error);
