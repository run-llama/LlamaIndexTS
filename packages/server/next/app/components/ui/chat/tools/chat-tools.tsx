"use client";

import {
  Message,
  MessageAnnotation,
  getChatUIAnnotation,
  useChatMessage,
  useChatUI,
} from "@llamaindex/chat-ui";
import { JSONValue } from "ai";
import { useMemo } from "react";
import { WeatherCard, WeatherData } from "./weather-card";

export function ToolAnnotations() {
  // TODO: This is a bit of a hack to get the artifact version. better to generate the version in the tool call and
  // store it in CodeArtifact
  const { messages } = useChatUI();
  const { message } = useChatMessage();
  const artifactVersion = useMemo(
    () => getArtifactVersion(messages, message),
    [messages, message],
  );
  // Get the tool data from the message annotations
  const annotations = message.annotations as MessageAnnotation[] | undefined;
  const toolData = annotations
    ? (getChatUIAnnotation(annotations, "tools") as unknown as ToolData[])
    : null;
  return toolData?.[0] ? (
    <ChatTools data={toolData[0]} artifactVersion={artifactVersion} />
  ) : null;
}

// TODO: Used to render outputs of tools. If needed, add more renderers here.
function ChatTools({
  data,
  artifactVersion,
}: {
  data: ToolData;
  artifactVersion: number | undefined;
}) {
  if (!data) return null;
  const { toolCall, toolOutput } = data;

  if (toolOutput.isError) {
    return (
      <div className="border-l-2 border-red-400 pl-2">
        There was an error when calling the tool {toolCall.name} with input:{" "}
        <br />
        {JSON.stringify(toolCall.input)}
      </div>
    );
  }

  switch (toolCall.name) {
    case "get_weather_information": {
      const weatherData = toolOutput.output as unknown as WeatherData;
      return <WeatherCard data={weatherData} />;
    }
    default:
      return null;
  }
}

type ToolData = {
  toolCall: {
    id: string;
    name: string;
    input: {
      [key: string]: JSONValue;
    };
  };
  toolOutput: {
    output: JSONValue;
    isError: boolean;
  };
};

function getArtifactVersion(
  messages: Message[],
  message: Message,
): number | undefined {
  const messageId = "id" in message ? message.id : undefined;
  if (!messageId) return undefined;
  let versionIndex = 1;
  for (const m of messages) {
    const toolData = m.annotations
      ? (getChatUIAnnotation(m.annotations, "tools") as unknown as ToolData[])
      : null;

    if (toolData?.some((t) => t.toolCall.name === "artifact")) {
      if ("id" in m && m.id === messageId) {
        return versionIndex;
      }
      versionIndex++;
    }
  }
  return undefined;
}
