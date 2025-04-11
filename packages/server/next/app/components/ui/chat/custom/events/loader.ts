import * as Babel from "@babel/standalone"; // Import Babel standalone for runtime transpilation
import { JSONValue } from "@llamaindex/chat-ui";
import React, { FunctionComponent } from "react";
import { getConfig } from "../../../lib/utils";
import { ComponentDef } from "./types";

export type SourceComponentDef = {
  type: string; // eg. deep_research_event
  code: string; // source code for component
  filename: string; // eg. deep_research_event.tsx
};

export async function fetchComponentDefinitions(): Promise<ComponentDef[]> {
  const endpoint = getConfig("COMPONENTS_API");
  if (!endpoint) return [];

  try {
    const response = await fetch(endpoint);
    const components = (await response.json()) as SourceComponentDef[];

    // Only need to handle transpilation now
    const transpiledComponents = await Promise.all(
      components.map(async (comp) => ({
        type: comp.type,
        comp: await transpileCode(comp.code, comp.filename),
      })),
    );

    return transpiledComponents.filter(
      (comp): comp is ComponentDef => comp.comp !== null,
    );
  } catch (error) {
    console.log("Error fetching dynamic components:", error);
    return [];
  }
}

// convert TSX code to JS code using Babel
export async function transpileCode(
  code: string,
  filename: string,
): Promise<FunctionComponent<{ events: JSONValue[] }> | null> {
  try {
    const transpiledCode = Babel.transform(code, {
      presets: ["react", "typescript"],
      filename,
    }).code;

    if (!transpiledCode) {
      console.error("Transpiled code is empty");
      return null;
    }

    return await createComponentFromCode(transpiledCode);
  } catch (error) {
    console.error("Error transpiling code:", error);
    return null;
  }
}

async function createComponentFromCode(
  code: string,
): Promise<FunctionComponent<{ events: JSONValue[] }>> {
  const Button = (await import("../../../button")).Button;
  const componentFn = new Function(
    "React",
    "Button",
    `${code}; return Component;`,
  );
  return componentFn(React, Button);
}
