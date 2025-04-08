"use client";

import {
  getChatUIAnnotation,
  JSONValue,
  useChatMessage,
} from "@llamaindex/chat-ui";
import React from "react";

export type ComponentDef = {
  type: string;
  code: string;
};

type EventComponent = ComponentDef & {
  events: JSONValue[];
};

export const DynamicEvents = ({
  componentDefs,
}: {
  componentDefs: ComponentDef[];
}) => {
  const { message } = useChatMessage();

  const components: EventComponent[] = componentDefs.map((comp) => {
    return {
      ...comp,
      events: getChatUIAnnotation(
        message.annotations,
        comp.type,
      ) as JSONValue[],
    };
  });

  if (components.length === 0) return null;

  return (
    <div className="components-container">
      {components.map((component, index) => {
        return (
          <React.Fragment key={`${component.type}-${index}`}>
            {renderEventComponent(component)}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export async function fetchComponentDefinitions() {
  try {
    const response = await fetch("/api/components");
    const componentsJson = await response.json();
    return componentsJson as ComponentDef[];
  } catch (error) {
    console.error("Error fetching dynamic components:", error);
    return [];
  }
}

function renderEventComponent(component: EventComponent) {
  try {
    const Component = createComponentFromCode(component.code);
    return React.createElement(Component, { events: component.events });
  } catch (error) {
    console.error(`Error rendering component ${component.type}:`, error);
    return null;
  }
}

function createComponentFromCode(code: string) {
  return new Function("React", `${code} return Component;`)(React);
}
