import * as fs from "fs";
import path from "path";

// Define popular Tailwind v4 utility categories
const colors: string[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "gray",
  "black",
  "white",
  "indigo",
  "teal",
  "orange",
];
const shades: string[] = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];
const spacings: string[] = [
  "0",
  "px",
  "0.5",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "3.5",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "12",
  "14",
  "16",
  "20",
  "24",
  "28",
  "32",
  "36",
  "40",
];
const fontSizes: string[] = [
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
];
const borderWidths: string[] = ["0", "1", "2", "4", "8"];
const borderRadii: string[] = [
  "none",
  "sm",
  "DEFAULT",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "full",
];
const flexValues: string[] = ["1", "auto", "initial", "none"];
const displays: string[] = [
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "none",
];
const positions: string[] = [
  "static",
  "relative",
  "absolute",
  "fixed",
  "sticky",
];

// Generate popular Tailwind classes
const classes: string[] = [
  // Background colors
  ...colors.flatMap((color: string) =>
    shades.map((shade: string) => `bg-${color}-${shade}`),
  ),
  // Text colors
  ...colors.flatMap((color: string) =>
    shades.map((shade: string) => `text-${color}-${shade}`),
  ),
  // Padding
  ...spacings.map((space: string) => `p-${space}`),
  ...spacings.map((space: string) => `px-${space}`),
  ...spacings.map((space: string) => `py-${space}`),
  ...spacings.map((space: string) => `pt-${space}`),
  ...spacings.map((space: string) => `pr-${space}`),
  ...spacings.map((space: string) => `pb-${space}`),
  ...spacings.map((space: string) => `pl-${space}`),
  // Margin
  ...spacings.map((space: string) => `m-${space}`),
  ...spacings.map((space: string) => `mx-${space}`),
  ...spacings.map((space: string) => `my-${space}`),
  ...spacings.map((space: string) => `mt-${space}`),
  ...spacings.map((space: string) => `mr-${space}`),
  ...spacings.map((space: string) => `mb-${space}`),
  ...spacings.map((space: string) => `ml-${space}`),
  // Width and Height
  ...spacings.map((space: string) => `w-${space}`),
  ...spacings.map((space: string) => `h-${space}`),
  ...[
    "w-full",
    "w-screen",
    "w-auto",
    "w-1/2",
    "w-1/3",
    "w-2/3",
    "w-1/4",
    "w-3/4",
  ],
  ...["h-full", "h-screen", "h-auto"],
  // Font sizes
  ...fontSizes.map((size: string) => `text-${size}`),
  // Font weights
  ...[
    "font-thin",
    "font-extralight",
    "font-light",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
    "font-extrabold",
    "font-black",
  ],
  // Borders
  ...borderWidths.map((width: string) => `border-${width}`),
  ...colors.flatMap((color: string) =>
    shades.map((shade: string) => `border-${color}-${shade}`),
  ),
  // Border radius
  ...borderRadii.map((radius: string) => `rounded-${radius}`),
  // Flexbox
  ...flexValues.map((value: string) => `flex-${value}`),
  ...["flex-row", "flex-row-reverse", "flex-col", "flex-col-reverse"],
  ...[
    "justify-start",
    "justify-end",
    "justify-center",
    "justify-between",
    "justify-around",
    "justify-evenly",
  ],
  ...[
    "items-start",
    "items-end",
    "items-center",
    "items-baseline",
    "items-stretch",
  ],
  // Display
  ...displays,
  // Position
  ...positions,
  // Gaps
  ...spacings.map((space: string) => `gap-${space}`),
  // Shadows
  ...[
    "shadow-sm",
    "shadow",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
    "shadow-none",
  ],
  // Opacity
  ...[
    "opacity-0",
    "opacity-5",
    "opacity-10",
    "opacity-20",
    "opacity-25",
    "opacity-30",
    "opacity-40",
    "opacity-50",
    "opacity-60",
    "opacity-70",
    "opacity-75",
    "opacity-80",
    "opacity-90",
    "opacity-100",
  ],
  // Z-index
  ...["z-0", "z-10", "z-20", "z-30", "z-40", "z-50", "z-auto"],
  // Cursor
  ...[
    "cursor-pointer",
    "cursor-default",
    "cursor-not-allowed",
    "cursor-wait",
    "cursor-text",
  ],
  // Overflow
  ...[
    "overflow-auto",
    "overflow-hidden",
    "overflow-visible",
    "overflow-scroll",
  ],
].flat();

// Remove duplicates and sort
const uniqueClasses: string[] = [...new Set(classes)].sort();

// Write to html file for Tailwind content scanning
fs.writeFileSync(
  path.join("server", "app", "tailwind-classes.html"),
  `<div class="${uniqueClasses.join(" ")}"></div>`,
);

console.log("Generated tailwind-classes.html");
