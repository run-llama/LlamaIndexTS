import { JSONValue } from "@llamaindex/chat-ui";
import { FunctionComponent } from "react";

export type ComponentDef = {
  type: string; // eg. deep_research_event
  comp: FunctionComponent<{ events: JSONValue[] }>;
};
