"use client";
import { useEffect, useState } from "react";
import ReactTextTransition from "react-text-transition";

const supports = [
  "Next.js",
  "Node.js",
  "Hono",
  "Express.js",
  "Deno",
  "Nest.js",
  "Waku",
];

export const TextEffect = () => {
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCounter(
        (Math.floor(Math.random() * supports.length) + 1) % supports.length,
      );
    }, 4000);
    return () => {
      clearInterval(id);
    };
  }, []);
  return <ReactTextTransition inline>{supports[counter]}</ReactTextTransition>;
};
