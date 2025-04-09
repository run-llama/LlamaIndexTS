"use client";

import * as Babel from "@babel/standalone"; // Import Babel standalone for runtime transpilation
import {
  getChatUIAnnotation,
  JSONValue,
  MessageAnnotation,
  MessageAnnotationType,
  useChatMessage,
} from "@llamaindex/chat-ui";
import React, { useEffect, useRef } from "react";
import { getConfig } from "../lib/utils";

export type ComponentDef = {
  type: string; // eg. deep_research_event
  code: string; // eg. export const DeepResearchEvent = () => {...}
  filename: string; // eg. deep_research_event.tsx
};

type EventComponent = ComponentDef & {
  events: JSONValue[];
};

// image, document_file, sources, events, suggested_questions, agent
const BUILT_IN_CHATUI_COMPONENTS = Object.values(MessageAnnotationType);

export const DynamicEvents = ({
  componentDefs,
}: {
  componentDefs: ComponentDef[];
}) => {
  const {
    message: { annotations },
  } = useChatMessage();

  const shownWarningsRef = useRef<Set<string>>(new Set()); // track warnings

  // Check for missing components in annotations
  useEffect(() => {
    if (!annotations?.length) return;

    const availableComponents = new Set(componentDefs.map((comp) => comp.type));

    annotations.forEach((annotation: MessageAnnotation) => {
      const type = annotation.type;
      if (!type) return; // skip if annotation doesn't have a type

      const events = getChatUIAnnotation(annotations, type);

      // Skip if it's a built-in component or if we've already shown the warning
      if (
        BUILT_IN_CHATUI_COMPONENTS.includes(type) ||
        shownWarningsRef.current.has(type)
      ) {
        return;
      }

      // If we have events for a type but no component definition, show a warning
      if (events && !availableComponents.has(type)) {
        console.warn(
          `No component found for event type: ${type}. Please add a component file named ${type}.tsx or ${type}.jsx in your components directory.`,
        );
        shownWarningsRef.current.add(type);
      }
    });
  }, [annotations, componentDefs]);

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
  const endpoint = getConfig("COMPONENTS_API");
  if (!endpoint) return [];

  try {
    const response = await fetch(endpoint);
    const components = (await response.json()) as ComponentDef[];

    // Only need to handle transpilation now
    const transpiledComponents = components
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
