"use client";

import { getConfig } from "../lib/utils";

/**
 * The default border color has changed to `currentColor` in Tailwind CSS v4,
 * so adding these compatibility styles to make sure everything still
 * looks the same as it did with Tailwind CSS v3.
 */
const tailwindConfig = `
@import "tailwindcss";

@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}
`;

export function ChatInjection() {
  if (!getConfig("COMPONENTS_API") && !getConfig("USE_CANVAS")) return null;
  return (
    <>
      <script
        async
        src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
      ></script>
      <style type="text/tailwindcss">{tailwindConfig}</style>
    </>
  );
}
