"use client";

import {
  getCustomAnnotation,
  JSONValue,
  useChatMessage,
} from "@llamaindex/chat-ui";
import React from "react";

type ComponentDef = {
  type: string;
  code: string;
  events: JSONValue[];
};

export const DynamicEvents = () => {
  const { message } = useChatMessage();
  const [components, setComponents] = React.useState<ComponentDef[]>([]);

  React.useEffect(() => {
    async function initComponents() {
      const componentDefinitions = await fetchComponentDefinitions();

      const components = componentDefinitions.map((component) => {
        return {
          ...component,
          events: getCustomAnnotation(
            message.annotations,
            (annotation) =>
              annotation !== null &&
              typeof annotation === "object" &&
              "type" in annotation &&
              annotation.type === component.type,
          ),
        };
      });

      setComponents(components);
    }

    initComponents();
  }, []);

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

async function fetchComponentDefinitions() {
  try {
    const response = await fetch("/api/components");
    const componentsJson = await response.json();
    return componentsJson.data as Omit<ComponentDef, "events">[];
  } catch (error) {
    console.error("Error fetching dynamic components:", error);
    return [];
  }
}

function renderEventComponent(component: ComponentDef) {
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
