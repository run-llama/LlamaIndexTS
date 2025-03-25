"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getConfig = (name: string) => {
  if (typeof window === "undefined") return undefined;
  return (window as any).LLAMAINDEX?.[name];
};
