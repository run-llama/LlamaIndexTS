"use client";

import { getCustomAnnotation, useChatMessage } from "@llamaindex/chat-ui";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock,
  NotebookPen,
  Search,
} from "lucide-react";
import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../accordion";
import { Card, CardContent, CardHeader, CardTitle } from "../../card";
import { cn } from "../../lib/utils";
import { Markdown } from "./markdown";

// Streaming event types
type EventState = "pending" | "inprogress" | "done" | "error";

type DeepResearchEvent = {
  type: "deep_research_event";
  data: {
    event: "retrieve" | "analyze" | "answer";
    state: EventState;
    id?: string;
    question?: string;
    answer?: string | null;
  };
};

// UI state types
type QuestionState = {
  id: string;
  question: string;
  answer: string | null;
  state: EventState;
  isOpen: boolean;
};

type DeepResearchCardState = {
  retrieve: {
    state: EventState | null;
  };
  analyze: {
    state: EventState | null;
    questions: QuestionState[];
  };
};

interface DeepResearchCardProps {
  className?: string;
}

const stateIcon: Record<EventState, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  inprogress: <CircleDashed className="h-4 w-4 text-blue-500 animate-spin" />,
  done: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
};

// Transform the state based on the event without mutations
const transformState = (
  state: DeepResearchCardState,
  event: DeepResearchEvent,
): DeepResearchCardState => {
  switch (event.data.event) {
    case "answer": {
      const { id, question, answer } = event.data;
      if (!id || !question) return state;

      const updatedQuestions = state.analyze.questions.map((q) => {
        if (q.id !== id) return q;
        return {
          ...q,
          state: event.data.state,
          answer: answer ?? q.answer,
        };
      });

      const newQuestion = !state.analyze.questions.some((q) => q.id === id)
        ? [
            {
              id,
              question,
              answer: answer ?? null,
              state: event.data.state,
              isOpen: false,
            },
          ]
        : [];

      return {
        ...state,
        analyze: {
          ...state.analyze,
          questions: [...updatedQuestions, ...newQuestion],
        },
      };
    }

    case "retrieve":
    case "analyze":
      return {
        ...state,
        [event.data.event]: {
          ...state[event.data.event],
          state: event.data.state,
        },
      };

    default:
      return state;
  }
};

// Convert deep research events to state
const deepResearchEventsToState = (
  events: DeepResearchEvent[] | undefined,
): DeepResearchCardState => {
  if (!events?.length) {
    return {
      retrieve: { state: null },
      analyze: { state: null, questions: [] },
    };
  }

  const initialState: DeepResearchCardState = {
    retrieve: { state: null },
    analyze: { state: null, questions: [] },
  };

  return events.reduce(
    (acc: DeepResearchCardState, event: DeepResearchEvent) =>
      transformState(acc, event),
    initialState,
  );
};

export function DeepResearchCard({ className }: DeepResearchCardProps) {
  const { message } = useChatMessage();

  const state = useMemo(() => {
    const deepResearchEvents = getCustomAnnotation<DeepResearchEvent>(
      message.annotations,
      (annotation) => annotation?.type === "deep_research_event",
    );
    if (!deepResearchEvents.length) return null;
    return deepResearchEventsToState(deepResearchEvents);
  }, [message.annotations]);

  if (!state) return null;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-4">
        {state.retrieve.state !== null && (
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {state.retrieve.state === "inprogress"
              ? "Searching..."
              : "Search completed"}
          </CardTitle>
        )}
        {state.analyze.state !== null && (
          <CardTitle className="flex items-center gap-2 border-t pt-4">
            <NotebookPen className="h-5 w-5" />
            {state.analyze.state === "inprogress" ? "Analyzing..." : "Analysis"}
          </CardTitle>
        )}
      </CardHeader>

      <CardContent>
        {state.analyze.questions.length > 0 && (
          <Accordion type="single" collapsible className="space-y-2">
            {state.analyze.questions.map((question: QuestionState) => (
              <AccordionItem
                key={question.id}
                value={question.id}
                className="border rounded-lg [&[data-state=open]>div]:rounded-b-none"
              >
                <AccordionTrigger className="hover:bg-accent hover:no-underline py-3 px-3 gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">
                      {stateIcon[question.state]}
                    </div>
                    <span className="font-medium text-left flex-1">
                      {question.question}
                    </span>
                  </div>
                </AccordionTrigger>
                {question.answer && (
                  <AccordionContent className="border-t px-3 py-3">
                    <Markdown content={question.answer} />
                  </AccordionContent>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
