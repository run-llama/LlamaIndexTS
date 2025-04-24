import { parse } from "@babel/parser";
import type { NodePath } from "@babel/traverse";
import traverse from "@babel/traverse";
import type {
  ExportDefaultDeclaration,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
} from "@babel/types";
import { createWorkflow, getContext, workflowEvent } from "@llama-flow/core";
import { collect } from "@llama-flow/core/stream/consumer";
import { until } from "@llama-flow/core/stream/until";
import type { LLM } from "llamaindex";
import type { ZodType } from "zod";

const writeAggregationEvent = workflowEvent<{
  eventSchema: object;
  uiDescription: string;
}>();

const writeUiComponentEvent = workflowEvent<{
  eventSchema: object;
  uiDescription: string;
  aggregationFunction: string | undefined;
}>();

const refineGeneratedCodeEvent = workflowEvent<{
  uiCode: string;
  aggregationFunction: string;
  uiDescription: string;
}>();

const startEvent = workflowEvent<{
  eventSchema: object;
}>();
const stopEvent = workflowEvent<string | null>();

const CODE_STRUCTURE = `
// export the component
// The component accepts an 'events' array prop. Each item in the array conforms to the schema provided during generation.
export default function Component({ events }) {
  // logic for aggregating events (if needed)
  const aggregatedEvents = // ... aggregation logic based on aggregationFunction description ...

  // Determine which events to render (original or aggregated)
  const eventsToRender = aggregatedEvents || events;

  return (
    <div>
      {/* Render eventsToRender using shadcn/ui, lucide-react, tailwind CSS */}
      {/* Map over eventsToRender and display each one */}
      {/* Example: */}
      {/* {eventsToRender.map((event, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>Event Data</CardTitle> // Adjust title as needed
          </CardHeader>
          <CardContent>
            <pre>{JSON.stringify(event, null, 2)}</pre>
          </CardContent>
        </Card>
      ))} */}
    </div>
  );
}
`;

const SOURCE_MAP: Record<string, boolean> = {
  react: true,
  "react-dom": true,
  "@/components/ui/accordion": true,
  "@/components/ui/alert": true,
  "@/components/ui/alert-dialog": true,
  "@/components/ui/aspect-ratio": true,
  "@/components/ui/avatar": true,
  "@/components/ui/badge": true,
  "@/components/ui/breadcrumb": true,
  "@/components/ui/button": true,
  "@/components/ui/calendar": true,
  "@/components/ui/card": true,
  "@/components/ui/carousel": true,
  "@/components/ui/chart": true,
  "@/components/ui/checkbox": true,
  "@/components/ui/collapsible": true,
  "@/components/ui/command": true,
  "@/components/ui/context-menu": true,
  "@/components/ui/dialog": true,
  "@/components/ui/drawer": true,
  "@/components/ui/dropdown-menu": true,
  "@/components/ui/form": true,
  "@/components/ui/hover-card": true,
  "@/components/ui/input": true,
  "@/components/ui/input-otp": true,
  "@/components/ui/label": true,
  "@/components/ui/menubar": true,
  "@/components/ui/navigation-menu": true,
  "@/components/ui/pagination": true,
  "@/components/ui/popover": true,
  "@/components/ui/progress": true,
  "@/components/ui/radio-group": true,
  "@/components/ui/resizable": true,
  "@/components/ui/scroll-area": true,
  "@/components/ui/select": true,
  "@/components/ui/separator": true,
  "@/components/ui/sheet": true,
  "@/components/ui/sidebar": true,
  "@/components/ui/skeleton": true,
  "@/components/ui/slider": true,
  "@/components/ui/sonner": true,
  "@/components/ui/switch": true,
  "@/components/ui/table": true,
  "@/components/ui/tabs": true,
  "@/components/ui/textarea": true,
  "@/components/ui/toggle": true,
  "@/components/ui/toggle-group": true,
  "@/components/ui/tooltip": true,
  "@/components/lib/utils": true,
  "@/lib/utils": true,
  "lucide-react": true,
  "@llamaindex/chat-ui/widgets": true,
};

function generateSupportedDeps(): string {
  // Extract all shadcn component names from SOURCE_MAP
  const shadcnComponents = Object.keys(SOURCE_MAP)
    .filter((key) => key.startsWith("@/components/ui/"))
    .map((key) => key.replace("@/components/ui/", ""))
    .sort()
    .join(", ");

  return `
        - React: import { useState } from "react";
        - shadcn/ui: import { ComponentName } from "@/components/ui/<component_path>";
            Supported shadcn components:  
                ${shadcnComponents}  
        - lucide-react: import { IconName } from "lucide-react";
        - tailwind css: import { cn } from "@/lib/utils"; // Note: clsx is not supported
        - LlamaIndex's markdown-ui: import { Markdown } from "@llamaindex/chat-ui/widgets";
`;
}

const SUPPORTED_DEPS = generateSupportedDeps();

function validateComponentCode(code: string): {
  isValid: boolean;
  error?: string;
  componentName?: string;
} {
  try {
    const imports: Array<{ name: string; source: string }> = [];
    let componentName: string | null = null;

    // Parse the code into an AST
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // Traverse the AST to find import declarations
    traverse(ast, {
      // Find import declarations
      ImportDeclaration(path: NodePath<ImportDeclaration>) {
        path.node.specifiers.forEach(
          (
            specifier:
              | ImportSpecifier
              | ImportDefaultSpecifier
              | ImportNamespaceSpecifier,
          ) => {
            if (
              specifier.type === "ImportSpecifier" ||
              specifier.type === "ImportDefaultSpecifier"
            ) {
              imports.push({
                name: specifier.local.name, // e.g., "Button"
                source: path.node.source.value, // e.g., "@/components/ui/button"
              });
            }
          },
        );
      },
      // Find export default declaration
      ExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>) {
        const declaration = path.node.declaration;
        if (declaration.type === "FunctionDeclaration" && declaration.id) {
          componentName = declaration.id.name; // e.g., "EventTimeline"
        } else if (
          declaration.type === "Identifier" &&
          path.scope.hasBinding(declaration.name)
        ) {
          componentName = declaration.name; // e.g., named function assigned to export
        }
      },
    });

    // Validate imports
    for (const { name, source } of imports) {
      if (!(source in SOURCE_MAP)) {
        console.error(`Invalid import: ${name} from ${source}`);
        return {
          isValid: false,
          error: `Failed to import ${name} from ${source}. Reason: Module not found. 
          \nHere is the list of supported imports: ${SUPPORTED_DEPS}`,
        };
      }
    }

    // Validate component export
    if (!componentName) {
      console.warn("Could not identify component name in the generated code.");
    }

    return {
      isValid: true,
      ...(componentName ? { componentName } : {}),
    };
  } catch (error) {
    console.error("Error during code validation:", error);
    return {
      isValid: false,
      error:
        error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}

/**
 * Creates the UI generation workflow with the provided LLM instance.
 *
 * @param llm - The LLM instance to use for the workflow.
 * @returns The configured workflow instance.
 */
export function createGenUiWorkflow(llm: LLM) {
  const genUiWorkflow = createWorkflow();

  genUiWorkflow.handle([startEvent], async ({ data: { eventSchema } }) => {
    const context = getContext();

    const planningPrompt = `
# Your role
You are an AI assistant helping to plan a React UI component. This component will display *one or more events* in a chat application, all conforming to a single JSON schema.

# Context
Here is the JSON schema for the events the component needs to display:
${JSON.stringify(eventSchema, null, 2)}

# Task
1. Analyze the event schema.
2. Decide if multiple events of this type should be aggregated before rendering in the UI (e.g., group similar events, summarize sequences). Assume the component will receive an array of these events.
3. If aggregation is needed, provide a *brief* description of the JavaScript function logic (no code implementation yet, just the logic description) that would take an array of events and return an aggregated representation.
4. Provide a concise description of the desired UI look and feel for displaying these events (e.g., "Display each event in a card with an icon representing the event type.").

e.g: Assume that the backend produce list of events with animal name, action, and status.
    \`\`\`
    A card-based layout displaying animal actions:
    - Each card shows an animal's image at the top
    - Below the image: animal name as the card title
    - Action details in the card body with an icon (eating 🍖, sleeping 😴, playing 🎾)
    - Status badge in the corner showing if action is ongoing/completed
    - Expandable section for additional details
    - Soft color scheme based on action type
    \`\`\`

Don't be verbose, just return the description for the UI based on the event schema and data.
`;

    try {
      const response = await llm.complete({
        prompt: planningPrompt,
        stream: false,
      });

      const responseText = response.text.trim();
      console.log("\nUI Description:", responseText);

      context.sendEvent(
        writeAggregationEvent.with({
          eventSchema,
          uiDescription: responseText,
        }),
      );
    } catch (error) {
      console.error("Error during UI planning:", error);
      context.sendEvent(stopEvent.with(null));
    }
  });

  genUiWorkflow.handle([writeAggregationEvent], async ({ data: planData }) => {
    const context = getContext();

    const schemaContext = JSON.stringify(planData.eventSchema, null, 2);
    const uiDescriptionContext = planData.uiDescription;

    const writingPrompt = `
# Your role
You are a frontend developer who is developing a React component for given events that are emitted from a backend workflow.
Here are the events that you need to work on: ${schemaContext}
Here is the description of the UI: ${uiDescriptionContext}

# Task
Based on the description of the UI and the list of events, write the aggregation function that will be used to aggregate the events.
Take into account that the list of events grows with time. At the beginning, there is only one event in the list, and events are incrementally added. 
To render the events in a visually pleasing way, try to aggregate them by their attributes and render the aggregates instead of just rendering a list of all events.
Don't add computation to the aggregation function, just group the events by their attributes.
Make sure that the aggregation should reflect the description of the UI and the grouped events are not duplicated, make it as simple as possible to avoid unnecessary issues.

# Answer with the following format:
\`\`\`jsx
const aggregateEvents = () => {
    // code for aggregating events here if needed otherwise let the jsx code block empty
}
\`\`\`
`;

    try {
      const response = await llm.complete({
        prompt: writingPrompt,
        stream: false,
      });

      const generatedCode = response.text.trim();
      context.sendEvent(
        writeUiComponentEvent.with({
          eventSchema: planData.eventSchema,
          uiDescription: planData.uiDescription,
          aggregationFunction: generatedCode,
        }),
      );
    } catch (error) {
      console.error("Error during aggregation function writing:", error);
      context.sendEvent(stopEvent.with(null));
    }
  });

  genUiWorkflow.handle([writeUiComponentEvent], async ({ data: planData }) => {
    const context = getContext();

    const aggregationFunctionContext = planData.aggregationFunction
      ? `
# Here is the aggregation function that aggregates the events:
${planData.aggregationFunction}`
      : "";

    const schemaContext = JSON.stringify(planData.eventSchema, null, 2);
    const uiDescriptionContext = planData.uiDescription;

    const writingPrompt = `
# Your role
You are a frontend developer who is developing a React component using shadcn/ui, lucide-react, LlamaIndex's chat-ui, and tailwind css (cn) for the UI.
You are given a list of events and other context.
Your task is to write a beautiful UI for the events that will be included in a chat UI.

# Context:
Here are the events that you need to work on: ${schemaContext}
${aggregationFunctionContext}
Here is the description of the UI: 
    \`\`\`
    ${uiDescriptionContext}
    \`\`\`


# Only use the following dependencies: ${SUPPORTED_DEPS}

# Requirements:
- Write beautiful UI components for the events using the supported dependencies
- The component text/label should be specified for each event type.


# Instructions:
## Event and schema notice
- Based on the provided list of events, determine their types and attributes.
- It's normal that the schema is applied to all events, but the events might be completely different where some schema attributes aren't used.
- You should make the component visually distinct for each event type.
  e.g: A simple cat schema
    \`\`\`{"type": "cat", "action": ["jump", "run", "meow"], "jump": {"height": 10, "distance": 20}, "run": {"distance": 100}}\`\`\`
    You should display the jump, run and meow actions in different ways. Don't try to render "height" for the "run" and "meow" action.

## UI notice
- Use the supported dependencies for the UI.
- Be careful on state handling, make sure the update should be updated in the state and there is no duplicate state.
- For a long content, consider to use markdown along with dropdown to show the full content.
    e.g:
    \`\`\`jsx
    import { Markdown } from "@llamaindex/chat-ui/widgets";
    <Markdown content={content} />
    \`\`\`
- Try to make the component placement not monotonous, consider use row/column/flex/grid layout.
`;

    try {
      const response = await llm.complete({
        prompt: writingPrompt,
        stream: false,
      });

      const generatedCode = response.text.trim();

      context.sendEvent(
        refineGeneratedCodeEvent.with({
          uiCode: generatedCode,
          aggregationFunction: planData.aggregationFunction || "",
          uiDescription: planData.uiDescription,
        }),
      );
    } catch (error) {
      console.error("Error during UI component writing:", error);
      context.sendEvent(stopEvent.with(null));
    }
  });

  genUiWorkflow.handle(
    [refineGeneratedCodeEvent],
    async ({ data: writeData }) => {
      const context = getContext();
      const MAX_VALIDATION_ATTEMPTS = 3;

      let currentCode = writeData.uiCode;
      let attemptCount = 0;
      let validationError = null;

      while (attemptCount < MAX_VALIDATION_ATTEMPTS) {
        attemptCount++;
        if (attemptCount > 1) {
          console.log(
            `Refinement attempt ${attemptCount}/${MAX_VALIDATION_ATTEMPTS}`,
          );
        }

        try {
          // Build refinement prompt - include error info for subsequent attempts
          const errorSection =
            attemptCount > 1 && validationError
              ? `\n# Error to fix:\n${validationError}\n\n# Additional requirements:\n1. Only import from supported modules\n2. Ensure the component has an export default statement\n3. Component must accept an 'events' array prop`
              : "";

          const refiningPrompt = `
# Your role
You are a senior frontend developer reviewing React code written by a junior developer.

# Context:
- The goal is to create a React component that displays an array of events.
- Required Code Structure (Component accepts an \`events\` array prop):
${CODE_STRUCTURE}
- Aggregation Context (if any): ${writeData.aggregationFunction || "None"}
- ${attemptCount > 1 ? "Previous" : "Generated"} Code:
${currentCode}${errorSection}

# Task:
Review and refine the provided code. Ensure it strictly follows the "Required Code Structure" (including accepting the \`events\` array prop), implements any described aggregation logic correctly, imports are correct (individual shadcn/ui imports), and there are no obvious bugs or undefined variables.

# Output Format:
Return ONLY the final, refined code, enclosed in a single JSX code block (\`\`\`jsx ... \`\`\`). Do not add any explanations before or after the code block.
`;

          const response = await llm.complete({
            prompt: refiningPrompt,
            stream: false,
          });

          const refinedCode = response.text.trim();
          // Extract code from markdown block if present
          const codeMatch = refinedCode.match(/```jsx\n?([^]*?)\n?```/);
          if (codeMatch && codeMatch[1]) {
            currentCode = codeMatch[1].trim();
          } else {
            // Fallback if no block found - attempt cleanup
            currentCode = refinedCode.replace(/^```jsx|```$/g, "").trim();
            console.warn(
              "Could not find standard JSX code block in refinement response, using raw content.",
            );
          }

          // Validate the refined code
          const validation = validateComponentCode(currentCode);

          if (validation.isValid) {
            console.log(`\n✅ Code validated successfully`);
            context.sendEvent(stopEvent.with(currentCode));
            return;
          } else {
            validationError = validation.error;
            console.warn(
              `Validation failed (attempt ${attemptCount}/${MAX_VALIDATION_ATTEMPTS}): ${validation.error}`,
            );

            // If this was the last attempt, give up
            if (attemptCount >= MAX_VALIDATION_ATTEMPTS) {
              console.error(
                `Failed to generate valid code after ${MAX_VALIDATION_ATTEMPTS} attempts`,
              );
              context.sendEvent(stopEvent.with(null));
              return;
            }
            // Otherwise continue to the next iteration of the loop
          }
        } catch (error) {
          console.error(
            `Error during refinement attempt ${attemptCount}:`,
            error,
          );
          context.sendEvent(stopEvent.with(null));
          return;
        }
      }
    },
  );

  return genUiWorkflow;
}

/**
 * Generates a React UI component for displaying event data of a given type.
 *
 * @param eventType - A Zod schema representing the event type.
 * @param llm - The LLM instance to use for the workflow.
 *              We recommend using gpt-4.1, sonnet-3.7, or gemini-2.5-pro
 *              for better results
 * @returns The generated React component code as a string.
 */
export async function generateEventComponent(
  eventType: ZodType | object,
  llm: LLM,
): Promise<string> {
  let eventSchema: object = eventType;
  if ("parse" in eventType && "safeParse" in eventType) {
    // Zod schema given, convert to JSON schema including descriptions
    const zodToJsonSchema = (await import("zod-to-json-schema")).default;
    const zodEventSchema = zodToJsonSchema(eventType, {
      target: "openApi3",
    });
    if (!zodEventSchema) {
      throw new Error("Could not get JSON schema for the event type");
    }
    eventSchema = zodEventSchema;
  }
  console.log(`🎨 Starting UI generation...
`);

  try {
    const genUiWorkflow = createGenUiWorkflow(llm);

    const { stream, sendEvent } = genUiWorkflow.createContext();
    sendEvent(startEvent.with({ eventSchema }));

    // Collect all events until the stop event and get the last one
    const allEvents = await collect(until(stream, stopEvent));
    const result = allEvents[allEvents.length - 1];
    if (result?.data === null) {
      throw new Error("Workflow failed.");
    } else if (result) {
      console.log("\nWorkflow finished successfully.");
      return result.data;
    } else {
      throw new Error("Workflow result is undefined.");
    }
  } catch (error) {
    console.error("Workflow execution failed:", error);
    throw new Error(`UI generation workflow failed: ${error}`);
  }
}
