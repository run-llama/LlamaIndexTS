"use client";
import { createProcessor, run } from "@mdx-js/mdx";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { ReactNode, useDeferredValue } from "react";
import * as runtime from "react/jsx-runtime";
import useSWR from "swr";

const processor = createProcessor({
  outputFormat: "function-body",
});

export function ClientMDXContent({
  content,
  id,
}: {
  content: string;
  id: number;
}): ReactNode {
  const deferredContent = useDeferredValue(content);
  const { data: jsx } = useSWR(["mdx", id, deferredContent], {
    fetcher: async () => {
      const code = await processor
        .process(deferredContent)
        .then((vfile) => vfile.value);
      const { default: Content } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
      });
      return (
        <Content
          components={{
            ...defaultMdxComponents,
          }}
        />
      );
    },
    suspense: true,
  });

  return jsx;
}
