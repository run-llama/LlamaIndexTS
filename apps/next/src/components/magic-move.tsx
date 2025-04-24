"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CodeBlock } from "fumadocs-ui/components/codeblock";
import { RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, use, useCallback, useEffect, useState } from "react";
import { createJavaScriptRegexEngine, getSingletonHighlighter } from "shiki";
import { ShikiMagicMove } from "shiki-magic-move/react";

const engine = createJavaScriptRegexEngine();
const highlighterPromise = getSingletonHighlighter({
  engine,
  themes: ["vesper", "github-light"],
  langs: ["js", "ts", "tsx"],
});

export type MagicMoveProps = {
  code: string[];
  placeholder: ReactNode;
};

export function MagicMove(props: MagicMoveProps) {
  const [mounted, setMounted] = useState(false);
  const [move, setMove] = useState<number>(0);
  const currentCode = props.code[move];
  const highlighter = use(highlighterPromise);
  const { resolvedTheme } = useTheme();

  const animate = useCallback(() => {
    setMove((move) => (move + 1) % props.code.length);
  }, [props.code]);

  useEffect(() => {
    if (move === props.code.length - 1) {
      return;
    } else {
      const interval = setInterval(animate, 3000);
      return () => clearInterval(interval);
    }
  }, [animate, move, props.code]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return props.placeholder;

  return (
    <CodeBlock allowCopy={false}>
      <ShikiMagicMove
        className="shiki !block p-4 *:!inline"
        lang="ts"
        theme={resolvedTheme === "dark" ? "vesper" : "github-light"}
        highlighter={highlighter}
        code={currentCode}
        options={{
          duration: 800,
          stagger: 0.3,
          lineNumbers: false,
          containerStyle: false,
        }}
      />
      <Button
        className={cn(
          "absolute bottom-2 right-2",
          move !== props.code.length - 1 ? "hidden" : "",
        )}
        variant="ghost"
        size="icon"
        disabled={move !== props.code.length - 1}
        onClick={animate}
      >
        <RotateCcw />
      </Button>
    </CodeBlock>
  );
}
