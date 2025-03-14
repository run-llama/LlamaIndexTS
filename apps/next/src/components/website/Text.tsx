import clsx from "clsx";
import { Fragment, ReactNode } from "react";

import { HeadingUnderline } from "@/components/website/HeadingUnderline";

import styles from "./Text.module.css";

export interface TextProps {
  align?: "left" | "center" | "right";
  size?: 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 60;
  family?: "inter" | "spaceGrotesk" | "sourceCodePro";
  weight?: 400 | 500 | 600;
  children?: ReactNode;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maximumWidth?: any;
}

const Text = ({
  align = "left",
  weight,
  children,
  className,
  size = 16,
  family,
  maximumWidth,
  as = "p",
}: TextProps) => {
  const Component = as;

  const renderTextWithComponent = (substring: string) => {
    if (substring.startsWith("|") && substring.endsWith("|")) {
      const content = substring.slice(1, -1);

      return <HeadingUnderline>{content}</HeadingUnderline>;
    }

    return substring;
  };

  const renderedString =
    children &&
    typeof children === "string" &&
    children
      .toString()
      .split(/(\|.*?\|)/g)
      .map((substring: string) => (
        <Fragment key={substring}>
          {renderTextWithComponent(substring)}
        </Fragment>
      ));

  return (
    <Component
      className={clsx(
        styles.text,
        align && styles[`text-align-${align}`],
        size && styles[`text-size-${size}`],
        weight && styles[`text-weight-${weight}`],
        family && styles[`text-family-${family}`],
        className,
      )}
      style={{ maxWidth: maximumWidth ? `${maximumWidth}px` : undefined }}
    >
      {renderedString || children}
    </Component>
  );
};

export { Text };
