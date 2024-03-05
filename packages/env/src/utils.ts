export function getEnv(name: string): string | undefined {
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    // @ts-expect-error
    if (typeof Deno === "undefined") {
      throw new Error("Current environment is not supported");
    } else {
      // @ts-expect-error
      return Deno.env.get(name);
    }
  }
  return process.env[name];
}
