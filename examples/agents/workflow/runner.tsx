import { openai } from "@llamaindex/openai";
import { Box, render, Text } from "ink";
import React from "react";

import {
  agentStreamEvent,
  startAgentEvent,
  stopAgentEvent,
} from "@llamaindex/workflow";

import {
  artifactEvent,
  createDocumentArtifactWorkflow,
  UIEvent,
  uiEvent,
} from "./doc-workflow";

// Import Artifact type (assuming it's exported from doc-workflow.ts)
// If not exported, we'd define a simplified version here or use 'any' temporarily.
// Based on the read file, Artifact is a Zod schema inference.
// We can either import it or define a similar structure for props.
// For now, let's assume it's available from './doc-workflow'.
import type { Artifact } from "./doc-workflow"; // Assuming Artifact is exported

const llm = openai({ model: "gpt-4.1-mini" });

// Define the props for our UI component
interface WorkflowUIProps {
  uiEvent: UIEvent;
}

// React component to render the UI using Ink
const WorkflowUI: React.FC<WorkflowUIProps> = ({ uiEvent }) => {
  const contentWidth = 60;
  const stateColorMap: { [key: string]: string } = {
    plan: "yellow",
    generate: "blue",
    completed: "green",
  };

  const state = uiEvent.data.state;
  const coloredStateText = (
    <Text color={stateColorMap[state] || "white"}>{state.toUpperCase()}</Text>
  );

  const title = "💡 Workflow Event";
  const requirementLabel = "Requirement: ";

  return (
    <Box
      borderStyle="round"
      borderColor="gray"
      flexDirection="column"
      paddingX={1}
      width={contentWidth + 2 + 2}
    >
      <Box justifyContent="center" paddingTop={0} paddingBottom={0}>
        <Text>{title}</Text>
      </Box>

      <Box borderStyle="single" borderColor="gray" height={1} marginY={1} />

      <Box flexDirection="column">
        <Box>
          <Text>State: </Text>
          {coloredStateText}
        </Box>

        {uiEvent.data.requirement !== undefined && (
          <Box flexDirection="row" marginTop={1}>
            <Text>{requirementLabel}</Text>
            <Box flexGrow={1} flexShrink={1} marginLeft={1}>
              <Text>{uiEvent.data.requirement}</Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// --- BEGIN NEW ARTIFACT UI COMPONENT ---
interface ArtifactUIProps {
  artifact: Artifact; // Use the imported Artifact type
}

const ArtifactUI: React.FC<ArtifactUIProps> = ({ artifact }) => {
  const artifactData = artifact.data.data; // Access nested data
  const contentWidth = 80; // Allow more width for artifact content

  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      flexDirection="column"
      padding={1}
      width={contentWidth + 2 + 2} // Account for padding and border
    >
      <Box justifyContent="center" paddingBottom={1}>
        <Text bold color="cyan">
          📄 Artifact Generated: {artifactData.title}
        </Text>
      </Box>

      <Box borderStyle="single" borderColor="gray" marginY={1} />

      <Box flexDirection="column" gap={1}>
        <Box>
          <Text bold>Title: </Text>
          <Text>{artifactData.title}</Text>
        </Box>
        <Box>
          <Text bold>Type: </Text>
          <Text>{artifactData.type}</Text>
        </Box>
        <Box flexDirection="column">
          <Text bold>Content:</Text>
          {/* Add a Box for content to allow it to take up space and wrap */}
          <Box borderStyle="round" borderColor="gray" padding={1} marginTop={1}>
            <Text>{artifactData.content}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

async function main() {
  const workflow = createDocumentArtifactWorkflow(llm, [], undefined);
  const { stream, sendEvent } = workflow.createContext();

  const { rerender, unmount, clear } = render(
    <Text>Waiting for workflow to start...</Text>,
  );

  sendEvent(
    startAgentEvent.with({ userInput: "Create a project guideline document." }),
  );

  for await (const event of stream.until(stopAgentEvent)) {
    if (agentStreamEvent.include(event)) {
      process.stdout.write(event.data.delta);
    } else if (uiEvent.include(event)) {
      if (event.data.data.state !== "completed") {
        rerender(<WorkflowUI uiEvent={event.data} />);
      }
    } else if (artifactEvent.include(event)) {
      rerender(<ArtifactUI artifact={event.data} />);
    }
  }

  unmount();

  console.log("\nWorkflow finished.");
}

main().catch(console.error);
