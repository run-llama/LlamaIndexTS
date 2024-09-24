export type Logger = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

function noop() {}

export const emptyLogger: Logger = Object.freeze({
  log: noop,
  error: noop,
  warn: noop,
});

export const consoleLogger: Logger = Object.freeze({
  log: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
});
