import glob from "fast-glob";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "src/content/docs");
const BUILD_DIR = path.join(process.cwd(), ".next");

// Regular expression to find internal links
// This captures Markdown links [text](/docs/path) and href attributes href="/docs/path"
const INTERNAL_LINK_REGEX = /(?:(?:\]\(|\bhref=["'])\/docs\/([^")]+))/g;

// Regular expression to find relative links
// This captures relative links like [text](./path) or ![alt](../images/image.png)
const RELATIVE_LINK_REGEX = /(?:\]\()(?:\s*)(?:\.\.?)\//g;

interface LinkValidationResult {
  file: string;
  invalidLinks: Array<{ link: string; line: number }>;
}

interface RelativeLinkResult {
  file: string;
  relativeLinks: Array<{ line: number; lineContent: string }>;
}

/**
 * Get all valid documentation routes from the content directory
 */
async function getValidRoutes(): Promise<Set<string>> {
  const mdxFiles = await glob("**/*.mdx", { cwd: CONTENT_DIR });

  const routes = new Set<string>();

  // Add each MDX file as a valid route
  for (const file of mdxFiles) {
    // Remove .mdx extension and normalize to route format
    let route = file.replace(/\.mdx$/, "");

    // Handle index files
    if (route.endsWith("/index")) {
      route = route.replace(/\/index$/, "");
    } else if (route === "index") {
      route = "";
    }

    routes.add(route);
  }

  return routes;
}

/**
 * Extract internal links from a MDX file
 */
function extractLinksFromFile(
  filePath: string,
): Array<{ link: string; line: number }> {
  const content = fs.readFileSync(filePath, "utf-8");
  const { content: mdxContent } = matter(content);

  const lines = mdxContent.split("\n");
  const links: Array<{ link: string; line: number }> = [];

  lines.forEach((line, lineNumber) => {
    let match;
    while ((match = INTERNAL_LINK_REGEX.exec(line)) !== null) {
      if (match[1]) {
        links.push({
          link: match[1],
          line: lineNumber + 1, // 1-based line numbers
        });
      }
    }
  });

  return links;
}

/**
 * Check if a link is an image link
 */
function isImageLink(link: string): boolean {
  // Check for image extensions
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];
  const hasImageExtension = imageExtensions.some((ext) =>
    link.toLowerCase().endsWith(ext),
  );

  // Check for markdown image syntax: ![alt](./path)
  const isMarkdownImage = link.trim().startsWith("!");

  return hasImageExtension || isMarkdownImage;
}

/**
 * Extract relative links from a MDX file
 */
function findRelativeLinksInFile(
  filePath: string,
): Array<{ line: number; lineContent: string }> {
  const content = fs.readFileSync(filePath, "utf-8");
  const { content: mdxContent } = matter(content);

  const lines = mdxContent.split("\n");
  const relativeLinks: Array<{ line: number; lineContent: string }> = [];

  lines.forEach((line, lineNumber) => {
    // Check for relative links
    if (RELATIVE_LINK_REGEX.test(line)) {
      // Reset the regex lastIndex to start from the beginning of the line
      RELATIVE_LINK_REGEX.lastIndex = 0;

      // Skip image links
      if (!isImageLink(line)) {
        relativeLinks.push({
          line: lineNumber + 1, // 1-based line numbers
          lineContent: line.trim(),
        });
      }
    }
  });

  return relativeLinks;
}

/**
 * Validate internal links in all MDX files
 */
/**
 * Find relative links in all MDX files
 */
async function findRelativeLinks(): Promise<RelativeLinkResult[]> {
  const mdxFiles = await glob("**/*.mdx", { cwd: CONTENT_DIR });
  const results: RelativeLinkResult[] = [];

  for (const file of mdxFiles) {
    const filePath = path.join(CONTENT_DIR, file);
    const relativeLinks = findRelativeLinksInFile(filePath);

    if (relativeLinks.length > 0) {
      results.push({
        file,
        relativeLinks,
      });
    }
  }

  return results;
}

async function validateLinks(): Promise<LinkValidationResult[]> {
  const mdxFiles = await glob("**/*.mdx", { cwd: CONTENT_DIR });
  const validRoutes = await getValidRoutes();

  const results: LinkValidationResult[] = [];

  for (const file of mdxFiles) {
    const filePath = path.join(CONTENT_DIR, file);
    const links = extractLinksFromFile(filePath);

    const invalidLinks = links.filter(({ link }) => {
      // Check if the link exists in valid routes
      // First normalize the link (remove any query string or hash)
      const normalizedLink = link.split("#")[0].split("?")[0];

      // Remove llamaindex/ prefix if it exists as it's the root of the docs
      let routePath = normalizedLink;
      if (routePath.startsWith("llamaindex/")) {
        routePath = routePath.substring("llamaindex/".length);
      }

      return !validRoutes.has(normalizedLink) && !validRoutes.has(routePath);
    });

    if (invalidLinks.length > 0) {
      results.push({
        file,
        invalidLinks,
      });
    }
  }

  return results;
}

/**
 * Main function to validate links and report errors
 */
async function main() {
  console.log("🔍 Validating links in documentation...");

  try {
    // Check for invalid internal links
    const validationResults: LinkValidationResult[] = [];
    await validateLinks();
    // Check for relative links
    const relativeLinksResults = await findRelativeLinks();

    let hasErrors = false;

    // Report invalid internal links
    if (validationResults.length > 0) {
      console.error("❌ Found invalid internal links:");
      hasErrors = true;

      for (const result of validationResults) {
        console.error(`\nFile: ${result.file}`);

        for (const { link, line } of result.invalidLinks) {
          console.error(`  - Line ${line}: /docs/${link}`);
        }
      }
    }

    // Report relative links
    if (relativeLinksResults.length > 0) {
      console.error("\n❌ Found relative links (use absolute paths instead):");
      hasErrors = true;

      for (const result of relativeLinksResults) {
        console.error(`\nFile: ${result.file}`);

        for (const { line, lineContent } of result.relativeLinks) {
          console.error(`  - Line ${line}: ${lineContent}`);
        }
      }
    }

    if (hasErrors) {
      // Exit with error code to fail the build
      process.exit(1);
    } else {
      console.log("✅ All links are valid!");
    }
  } catch (error) {
    console.error("Error validating links:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
