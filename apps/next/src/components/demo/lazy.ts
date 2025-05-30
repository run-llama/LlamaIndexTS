"use client";
import dynamic from "next/dynamic";

export const CodeNodeParserDemo = dynamic(() =>
  import("@/components/demo/code-node-parser").then(
    (mod) => mod.CodeNodeParserDemo,
  ),
);
