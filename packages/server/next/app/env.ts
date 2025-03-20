/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export const getConfig = (name: string) => {
  if (typeof window === "undefined") return undefined;
  return (window as any).LLAMAINDEX?.[name];
};
