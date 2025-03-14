"use client";
import { RotatingText } from "@/components/reactbits/rotating-text";

const supports = [
  "Next.js",
  "Node.js",
  "Hono",
  "Express.js",
  "Deno",
  "Nest.js",
  "Waku",
];

export const Supports = () => {
  return (
    <RotatingText
      texts={supports}
      mainClassName="inline-flex bg-transparent overflow-hidden justify-center"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-120%" }}
      staggerDuration={0.025}
      transition={{ type: "spring", damping: 30, stiffness: 400 }}
      rotationInterval={2000}
    />
  );
};
