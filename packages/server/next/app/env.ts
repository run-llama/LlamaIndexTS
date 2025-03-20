/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * A helper function to get environment variables from the window object
 * @param name - The name of the environment variable to get
 * @returns The value of the environment variable
 */
export const getEnv = (name: string) => {
  if (typeof window === "undefined") return undefined;
  return (window as any).LLAMAINDEX[name];
};
