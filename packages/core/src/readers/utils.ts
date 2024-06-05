// Note: this code is taken from p-limit 5.0.0 and modified to work with non NodeJS envs by removing AsyncResource which seems not be needed in our case and also it's not recommended to used anymore. If we need to preserve some state between async calls better use `AsyncLocalStorage`.
// Also removed dependency to yocto-queue by using normal Array

export type LimitFunction = {
  /**
	The number of promises that are currently running.
	*/
  readonly activeCount: number;

  /**
	The number of promises that are waiting to run (i.e. their internal `fn` was not called yet).
	*/
  readonly pendingCount: number;

  /**
	Discard pending promises that are waiting to run.

	This might be useful if you want to teardown the queue at the end of your program's lifecycle or discard any function calls referencing an intermediary state of your app.

	Note: This does not cancel promises that are already running.
	*/
  clearQueue: () => void;

  /**
	@param fn - Promise-returning/async function.
	@param arguments - Any arguments to pass through to `fn`. Support for passing arguments on to the `fn` is provided in order to be able to avoid creating unnecessary closures. You probably don't need this optimization unless you're pushing a lot of functions.
	@returns The promise returned by calling `fn(...arguments)`.
	*/
  <Arguments extends unknown[], ReturnType>(
    fn: (...arguments_: Arguments) => PromiseLike<ReturnType> | ReturnType,
    ...arguments_: Arguments
  ): Promise<ReturnType>;
};

export default function pLimit(concurrency: number): LimitFunction {
  if (
    !(
      (Number.isInteger(concurrency) ||
        concurrency === Number.POSITIVE_INFINITY) &&
      concurrency > 0
    )
  ) {
    throw new TypeError("Expected `concurrency` to be a number from 1 and up");
  }

  const queue = new Array();
  let activeCount = 0;

  const next = () => {
    activeCount--;

    if (queue.length > 0) {
      queue.shift()();
    }
  };

  const run = async (function_: any, resolve: any, arguments_: any) => {
    activeCount++;

    const result = (async () => function_(...arguments_))();
    resolve(result);

    try {
      await result;
    } catch {}

    next();
  };

  const enqueue = (function_: any, resolve: any, arguments_: any) => {
    queue.push(run.bind(undefined, function_, resolve, arguments_));

    (async () => {
      // This function needs to wait until the next microtask before comparing
      // `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
      // when the run function is dequeued and called. The comparison in the if-statement
      // needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
      await Promise.resolve();

      if (activeCount < concurrency && queue.length > 0) {
        queue.shift()();
      }
    })();
  };

  const generator = (function_: any, ...arguments_: any) =>
    new Promise((resolve) => {
      enqueue(function_, resolve, arguments_);
    });

  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount,
    },
    pendingCount: {
      get: () => queue.length,
    },
    clearQueue: {
      value() {
        queue.length = 0;
      },
    },
  });

  return generator as LimitFunction;
}
