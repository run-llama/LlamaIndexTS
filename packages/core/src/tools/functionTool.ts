import { BaseTool, ToolMetadata } from "../Tool";

type Callable = (...args: any[]) => any;
type AsyncCallable = (...args: any[]) => Promise<any>;

function syncToAsync(fn: Callable): AsyncCallable {
  return async (...args: any[]) => {
    // Emulate running in a separate thread/executor
    return new Promise((resolve) => {
      setTimeout(() => resolve(fn(...args)), 0);
    });
  };
}

export class FunctionTool implements BaseTool {
  private _fn: Callable;
  private _asyncFn: AsyncCallable;
  private _metadata: ToolMetadata;

  constructor(fn: Callable, metadata: ToolMetadata, asyncFn?: AsyncCallable) {
    this._fn = fn;
    this._asyncFn = asyncFn ?? syncToAsync(this._fn);
    this._metadata = metadata;
  }

  static fromDefaults(
    fn: Callable,
    metadata?: ToolMetadata,
    asyncFn?: AsyncCallable,
  ): FunctionTool {
    return new FunctionTool(fn, metadata!, asyncFn);
  }

  get metadata(): ToolMetadata {
    return this._metadata;
  }

  get fn(): AsyncCallable {
    return this._asyncFn;
  }

  async call(...args: any[]): Promise<any> {
    return this._fn(...args);
  }
}
