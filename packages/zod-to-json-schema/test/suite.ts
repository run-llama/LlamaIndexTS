import diff from "fast-diff";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[39m";

type TestContext = (assert: (result: any, expected?: any) => void) => void;
type TestFunction = (name: string, context: TestContext) => void;
type SuiteContext = (test: TestFunction) => void;
type ErrorMap = { [key: string]: Error };
type Error =
  | { missmatch: "value" | "type" | "length" | "keys"; expected: any; got: any }
  | { missmatch: "nested"; properties: { [key: string]: Error } };

export function suite(suiteName: string, suiteContext: SuiteContext): void {
  let tests = 0;
  let passedTests = 0;

  const test: TestFunction = (testName, testContext) => {
    tests++;

    let assertions = 0;
    let passedAssertions = 0;
    try {
      testContext((...args) => {
        assertions++;

        const error =
          args.length === 2
            ? assert(args[0], args[1], [])
            : args[0]
              ? undefined
              : ({
                  missmatch: "value",
                  expected: "truthy",
                  got: args[0],
                } satisfies Error);

        if (!error) {
          passedAssertions++;
        } else {
          console.error(
            `❌ ${suiteName}, ${testName}, assertion ${assertions} failed:`,
            formatError(error),
          );
        }
      });

      if (assertions === 0) {
        console.log(`⚠ ${suiteName}, ${testName}: No assertions found`);
      }

      if (assertions === passedAssertions) {
        passedTests++;
      }
    } catch (e) {
      console.error(
        `❌ ${suiteName}, ${testName}: Error thrown after ${assertions} ${
          assertions === 1 ? "assertion" : "assertions"
        }. Error:`,
        e,
      );
    }
  };

  suiteContext(test);

  if (tests === 0) {
    console.log(`⚠ ${suiteName}: No tests found`);
  } else if (tests === passedTests) {
    console.log(
      `✔ ${suiteName}: ${tests} ${tests === 1 ? "test" : "tests"} passed`,
    );
  } else {
    console.error(
      `❌ ${suiteName}: ${passedTests}/${tests} ${
        passedTests === 1 ? "test" : "tests"
      } passed`,
    );
    process.exitCode = 1;
  }
}

function formatError(error: Error, depth = 0): string {
  const indent = "  ".repeat(depth);

  if (error.missmatch === "nested") {
    return `{\n${indent}  ${Object.keys(error.properties)
      .map((key) => `${key}: ${formatError(error.properties[key], depth + 2)}`)
      .join(`\n${indent}  `)}\n${indent}}`;
  } else if (
    error.missmatch === "value" &&
    typeof error.expected === "string" &&
    typeof error.got === "string"
  ) {
    return `Diff = ${colorDiff(error.got, error.expected)}`;
  } else {
    return `Missmatch = ${error.missmatch}, Expected = ${error.expected}, Got = ${error.got}`;
  }
}

function assert(
  a: unknown,
  b: unknown,
  path: (string | number)[],
): Error | undefined {
  if (a === b) {
    return undefined;
  }

  if (typeof a === "object") {
    if (typeof b !== "object") {
      return { missmatch: "type", expected: typeof a, got: typeof b };
    }

    if (a === null) {
      return { missmatch: "value", expected: null, got: b };
    }

    if (b === null) {
      return { missmatch: "value", expected: a, got: null };
    }

    if (Array.isArray(a)) {
      if (!Array.isArray(b)) {
        return { missmatch: "type", expected: "object", got: "array" };
      }

      if (a.length !== b.length) {
        return { missmatch: "length", expected: b.length, got: a.length };
      }
    } else if (Array.isArray(b)) {
      return { missmatch: "type", expected: "array", got: "object" };
    }

    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();

    if (keysA.join() !== keysB.join()) {
      return { missmatch: "keys", got: keysA, expected: keysB };
    }

    let foundError = false;

    const errorMap = [...keysA, ...keysB].reduce((errorMap: ErrorMap, key) => {
      if (key in errorMap) {
        return errorMap;
      }

      const error = assert(a[key as keyof typeof a], b[key as keyof typeof b], [...path, key]);

      if (error) {
        foundError = true;

        errorMap[key] = error;
      }

      return errorMap;
    }, {});

    if (foundError) {
      return { missmatch: "nested", properties: errorMap };
    } else {
      return undefined;
    }
  }

  if (
    typeof a === "function" &&
    typeof b === "function" &&
    a.toString() === b.toString()
  ) {
    return undefined;
  }

  if (typeof a !== typeof b) {
    return { missmatch: "type", got: typeof a, expected: typeof b };
  }

  return { missmatch: "value", got: a, expected: b };
}

export function colorDiff(got: string, exp: string) {
  return (
    diff(got, exp).reduce(
      (acc, [type, value]) =>
        acc + (type === -1 ? GREEN : type === 1 ? RED : RESET) + value,
      "",
    ) + RESET
  );
}
