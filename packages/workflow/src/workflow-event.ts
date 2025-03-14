export type WorkflowEventInstance<
  Data = unknown,
  Type extends string = string,
> = {
  type: Type;
  __data: Data;
};

export type WorkflowEvent<Type extends string = string> = {
  <Data>(data: Data): WorkflowEventInstance<Data, Type>;
  same: <Data>(
    instance: unknown,
  ) => instance is WorkflowEventInstance<Data, Type>;
  type: Type;
};

export const workflowEvent = <Type extends string>(
  eventType: Type,
): WorkflowEvent<Type> => {
  const event = <Data>(data: Data): WorkflowEventInstance<Data, Type> => {
    return {
      type: eventType,
      __data: data,
    };
  };
  event.same = <Data>(
    instance: unknown,
  ): instance is WorkflowEventInstance<Data, Type> => {
    if (typeof instance !== "object" || instance === null) {
      return false;
    }
    if (!("__data" in instance)) {
      return false;
    }
    if (!("type" in instance)) {
      return false;
    }
    return instance.type === eventType;
  };
  event.type = eventType;
  return event;
};

// These are special events that are used to control the workflow
export type StartEvent = WorkflowEvent<"start">;
export type StartEventInstance<D> = WorkflowEventInstance<D, "start">;
export const startEvent = workflowEvent("start");

export type StopEvent = WorkflowEvent<"stop">;
export type StopEventInstance<D> = WorkflowEventInstance<D, "stop">;
export const stopEvent = workflowEvent("stop");
