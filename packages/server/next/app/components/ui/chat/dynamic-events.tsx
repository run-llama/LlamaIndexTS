"use client";

import * as Babel from "@babel/standalone"; // Import Babel standalone for runtime transpilation
import {
  getChatUIAnnotation,
  JSONValue,
  useChatMessage,
} from "@llamaindex/chat-ui";
import React from "react";
import { getConfig } from "../lib/utils";

export type ComponentDef = {
  type: string; // eg. deep_research_event
  code: string; // eg. export const DeepResearchEvent = () => {...}
  filename: string; // eg. deep_research_event.tsx
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
    const response = await fetch(getConfig("COMPONENTS_API"));
    const componentsJson = await response.json();
    const rawComponents = componentsJson as ComponentDef[];

    // Check for duplicate component types
    const componentTypeMap = new Map<string, ComponentDef>();

    rawComponents.forEach((comp) => {
      if (componentTypeMap.has(comp.type)) {
        const existingComp = componentTypeMap.get(comp.type)!;

        // Prefer .tsx files over others
        if (
          comp.filename.endsWith(".tsx") &&
          !existingComp.filename.endsWith(".tsx")
        ) {
          console.warn(
            `Replacing ${existingComp.filename} with ${comp.filename} for type: ${comp.type}`,
          );
          componentTypeMap.set(comp.type, comp);
        } else {
          console.warn(
            `Skipping duplicate component type: ${comp.type} (${comp.filename})`,
          );
        }
      } else {
        componentTypeMap.set(comp.type, comp);
      }
    });

    // Use only unique components
    const uniqueComponents = Array.from(componentTypeMap.values());

    const transpiledComponents = uniqueComponents
      .map((comp) => ({
        ...comp,
        code: transpileCode(comp.code, comp.filename),
      }))
      .filter((comp): comp is ComponentDef => comp.code !== null);
    return transpiledComponents;
  } catch (error) {
    console.log("Error fetching dynamic components:", error);
    return [];
  }
}

// convert TSX code to JS code using Babel
function transpileCode(code: string, filename: string): string | null {
  try {
    const transpiledCode = Babel.transform(code, {
      presets: ["react", "typescript"],
      filename,
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
