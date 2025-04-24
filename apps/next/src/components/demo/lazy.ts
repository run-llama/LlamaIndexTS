"use client";
import dynamic from "next/dynamic";

// lazy load client components
export const ChatDemo = dynamic(() =>
  import("@/components/demo/chat/api/demo").then((mod) => mod.ChatDemo),
);

export const CodeNodeParserDemo = dynamic(() =>
  import("@/components/demo/code-node-parser").then(
    (mod) => mod.CodeNodeParserDemo,
  ),
);
