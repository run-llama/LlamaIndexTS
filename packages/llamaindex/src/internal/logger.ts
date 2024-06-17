export type Logger = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

export const emptyLogger: Logger = Object.freeze({
  log: () => {},
  error: () => {},
  warn: () => {},
});

export const consoleLogger: Logger = Object.freeze({
  log: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
});
