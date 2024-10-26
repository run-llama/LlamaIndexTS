"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { use, useCallback, useEffect, useState } from "react";
import { getSingletonHighlighter } from "shiki";
import { ShikiMagicMove } from "shiki-magic-move/react";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

const highlighterPromise = getSingletonHighlighter({
  engine: createOnigurumaEngine(() => import("shiki/wasm")),
  themes: ["vesper", "github-light"],
  langs: ["js", "ts", "tsx"],
});

export type MagicMoveProps = {
  code: string[];
};

export function MagicMove(props: MagicMoveProps) {
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

  return (
    <CodeBlock allowCopy={false}>
      {highlighter && (
        <Pre>
          <ShikiMagicMove
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
        </Pre>
      )}
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
