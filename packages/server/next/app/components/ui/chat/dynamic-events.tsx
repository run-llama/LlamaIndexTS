"use client";

import * as Babel from "@babel/standalone"; // Import Babel standalone for runtime transpilation
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
  const {
    message: { annotations },
  } = useChatMessage();

  const components: EventComponent[] = componentDefs
    .map((comp) => {
      const events = getChatUIAnnotation(annotations, comp.type) as JSONValue[]; // get all event data by type
      if (!events?.length) return null;
      return { ...comp, events };
    })
    .filter((comp) => comp !== null);

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
  const startTime = performance.now();
  const transpiledCode = Babel.transform(code, {
    presets: ["react"], // Use the React preset to handle JSX
  }).code;

  const endTime = performance.now();
  console.log(
    `Time taken to transpile jsx to js: ${endTime - startTime} milliseconds`,
  );

  const componentFn = new Function(
    "React",
    `${transpiledCode}; return Component;`,
  );

  return componentFn(React);
}
