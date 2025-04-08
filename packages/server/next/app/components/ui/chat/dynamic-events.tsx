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

export async function fetchComponentDefinitions(): Promise<ComponentDef[]> {
  try {
    const response = await fetch("/api/components");
    const componentsJson = await response.json();
    const rawComponents = componentsJson as ComponentDef[];
    const transpiledComponents = rawComponents
      .map((comp) => ({
        ...comp,
        code: transpileCode(comp.code),
      }))
      .filter((comp): comp is ComponentDef => comp.code !== null);
    return transpiledComponents;
  } catch (error) {
    console.error("Error fetching dynamic components:", error);
    return [];
  }
}

function transpileCode(code: string): string | null {
  try {
    const transpiledCode = Babel.transform(code, {
      presets: ["react"],
    }).code;

    if (!transpiledCode) {
      console.error("Transpiled code is empty");
      return null;
    }

    return transpiledCode;
  } catch (error) {
    console.error("Error transpiling code:", error);
    return null;
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
  const componentFn = new Function("React", `${code}; return Component;`);
  return componentFn(React);
}
