export class WorkflowEvent<T extends Record<string, any> = any> {
  displayName: string;
  data: T;

  constructor(data: T) {
    this.data = data;
    this.displayName = this.constructor.name;
  }

  toString() {
    return this.displayName;
  }

  static or<
    A extends typeof WorkflowEvent<any>,
    B extends typeof WorkflowEvent<any>,
  >(AEvent: A, BEvent: B): A | B {
    function OrEvent() {
      throw new Error("Cannot instantiate OrEvent");
    }

    OrEvent.prototype = Object.create(AEvent.prototype);

    Object.getOwnPropertyNames(BEvent.prototype).forEach((property) => {
      if (!(property in OrEvent.prototype)) {
        Object.defineProperty(
          OrEvent.prototype,
          property,
          Object.getOwnPropertyDescriptor(BEvent.prototype, property)!,
        );
      }
    });

    OrEvent.prototype.constructor = OrEvent;

    Object.defineProperty(OrEvent, Symbol.hasInstance, {
      value: function (instance: unknown) {
        return instance instanceof AEvent || instance instanceof BEvent;
      },
    });

    return OrEvent as unknown as A | B;
  }
}

export type EventTypes = typeof WorkflowEvent<any>;

export class StartEvent<T = string> extends WorkflowEvent<{ input: T }> {}
export class StopEvent<T = string> extends WorkflowEvent<{ result: T }> {}
export class HaltEvent extends WorkflowEvent {}
