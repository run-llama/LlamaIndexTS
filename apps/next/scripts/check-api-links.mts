import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
interface CommandLineArgs {
  verbose: boolean;
}

function parseArgs(): CommandLineArgs {
  const args = process.argv.slice(2);
  return {
    verbose: args.includes("-v") || args.includes("--verbose"),
  };
}

// Command line arguments
const args = parseArgs();

// define directories to check
const DOCS_DIRS = ["cloud", "llamaindex"];

// API docs base path
const API_DOCS_BASE_PATH = path.resolve(__dirname, "../src/content/docs/api");

/**
 * Interface for API directory structure
 */
interface ApiDirectory {
  path: string; // Full path to the directory
  relativePath: string; // Path relative to API_DOCS_BASE_PATH
  name: string; // Directory name
}

/**
 * Get all API directories by recursively scanning the api directory
 */
async function getApiDirectories(): Promise<ApiDirectory[]> {
  const directories: ApiDirectory[] = [];

  async function scanDirectories(dirPath: string, relativePath: string = "") {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden directories and files
        if (entry.name.startsWith(".") || entry.name.startsWith("_")) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const entryRelativePath = relativePath
          ? path.join(relativePath, entry.name)
          : entry.name;

        if (entry.isDirectory()) {
          // Add this directory
          directories.push({
            path: fullPath,
            relativePath: entryRelativePath,
            name: entry.name,
          });

          // Recursively scan subdirectories
          await scanDirectories(fullPath, entryRelativePath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  }

  await scanDirectories(API_DOCS_BASE_PATH);

  // Log found directories
  console.log(`Found ${directories.length} API directories:`);
  directories.forEach((dir) => {
    console.log(`- ${dir.relativePath}`);
  });

  return directories;
}

/**
 * interface for API links
 */
interface ApiLink {
  text: string; // original link text
  path: string; // full path
  apiPath: string; // path within the api directory (e.g., "classes/test/MyClass")
  name: string; // API name (e.g. "MyClass")
  folder: string; // top-level folder name (e.g. "classes")
}

/**
 * interface for API references
 */
interface ApiReference {
  filePath: string; // source MDX file path
  links: ApiLink[]; // API links array
}

/**
 * interface for check results
 */
interface CheckResult {
  type: string; // API type path (e.g., "classes" or "classes/test")
  missing: string[]; // Missing API docs
  total: number; // Total references
  found: number; // Found docs
}

/**
 * recursively get all MDX files in a directory
 */
async function getMdxFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function scan(directory: string) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${directory}:`, error);
    }
  }

  await scan(dir);
  return files;
}

/**
 * extract content between "## API Reference" and the next "##" or file end
 */
function extractApiReferenceSection(content: string): string | null {
  const apiRefMatch = content.match(/## API Reference\s*([\s\S]*?)(?=\s*##|$)/);
  return apiRefMatch ? apiRefMatch[1].trim() : null;
}

/**
 * parse links in markdown list items with format "[name](/docs/api/folder/name)" or "[name](/docs/api/folder/subfolder/name)"
 */
function parseApiLinks(content: string): ApiLink[] {
  // Updated pattern to capture the entire path after /docs/api/
  const linkPattern = /- \[(.*?)\]\((\/docs\/api\/[^)]+)\)/g;
  const links: ApiLink[] = [];

  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const text = match[1];
    const fullPath = match[2];

    // parse path components from "/docs/api/path/to/name" format
    const pathParts = fullPath.split("/");
    if (
      pathParts.length >= 5 &&
      pathParts[1] === "docs" &&
      pathParts[2] === "api"
    ) {
      // Extract the API path (everything after /docs/api/)
      const apiPath = pathParts.slice(3).join("/");
      // The name is the last part of the path
      const name = pathParts[pathParts.length - 1];
      // The top-level folder is the first part after /docs/api/
      const folder = pathParts[3];

      links.push({
        text,
        path: fullPath,
        apiPath,
        name,
        folder,
      });
    }
  }

  return links;
}

/**
 * get API references from all MDX files in a document directory
 */
async function getAllApiReferences(docsDir: string): Promise<ApiReference[]> {
  const mdxFiles = await getMdxFiles(docsDir);
  const references: ApiReference[] = [];

  for (const filePath of mdxFiles) {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const apiSection = extractApiReferenceSection(content);

      if (apiSection) {
        const links = parseApiLinks(apiSection);
        if (links.length > 0) {
          references.push({
            filePath: path.relative(docsDir, filePath),
            links,
          });
        }
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }

  return references;
}

/**
 * check if a file exists
 */
async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * check if API references have corresponding document files
 */
async function checkApiLinks(
  references: ApiReference[],
  apiDirectories: ApiDirectory[],
): Promise<CheckResult[]> {
  // Create a map of all API directories by their relative path
  const apiDirMap = new Map<string, ApiDirectory>();
  apiDirectories.forEach((dir) => {
    apiDirMap.set(dir.relativePath, dir);
  });

  // Group links by their API path
  const linksByPath = new Map<string, Set<string>>();

  // Initialize with all known API directories
  apiDirectories.forEach((dir) => {
    linksByPath.set(dir.relativePath, new Set<string>());
  });

  // Collect all links
  references.forEach((ref) => {
    ref.links.forEach((link) => {
      // Get the directory part of the API path (without the name)
      const pathParts = link.apiPath.split("/");
      const dirPath =
        pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : pathParts[0];

      if (linksByPath.has(dirPath)) {
        linksByPath.get(dirPath)?.add(link.name);
      } else {
        // Handle links to paths that weren't found in API directory
        console.warn(
          `Warning: Unknown API path "${dirPath}" referenced in link to ${link.name}`,
        );
        // Create a new set for this path
        linksByPath.set(dirPath, new Set([link.name]));
      }
    });
  });

  // Check results
  const results: CheckResult[] = [];

  // Check each path of links
  for (const [dirPath, names] of linksByPath.entries()) {
    if (names.size === 0) continue;

    const folderPath = path.join(API_DOCS_BASE_PATH, dirPath);
    const missing: string[] = [];
    let found = 0;

    for (const name of names) {
      const docPath = path.join(folderPath, `${name}.mdx`);
      const exists = await fileExists(docPath);

      if (!exists) {
        missing.push(name);
      } else {
        found++;
      }
    }

    results.push({
      type: dirPath,
      missing,
      total: names.size,
      found,
    });
  }

  return results;
}

interface DocResult {
  docName: string;
  results: CheckResult[];
  references: ApiReference[];
}

/**
 * find and check API references in a specific document path
 */
async function findAndCheckReferences(
  docName: string,
  apiDirectories: ApiDirectory[],
): Promise<DocResult | null> {
  const docsDir = path.resolve(__dirname, "../src/content/docs/", docName);

  try {
    console.log(`Checking API references in ${docName} directory...`);
    const references = await getAllApiReferences(docsDir);

    if (references.length === 0) {
      console.log(`No API references found in ${docName} directory`);
      return null;
    }

    console.log(
      `Found ${references.length} files containing API references in ${docName} directory`,
    );

    // check if references have corresponding documents
    const results = await checkApiLinks(references, apiDirectories);
    return { docName, results, references };
  } catch (error) {
    console.error(`Error processing ${docName} directory:`, error);
    return null;
  }
}

async function main(): Promise<void> {
  console.log("Start checking API links...\n");

  // Dynamically get API directories by scanning the api directory
  const apiDirectories = await getApiDirectories();

  const allResults: DocResult[] = [];

  // check each document directory
  for (const docDir of DOCS_DIRS) {
    const result = await findAndCheckReferences(docDir, apiDirectories);
    if (result) {
      allResults.push(result);
    }
  }

  // log results
  console.log("\n===== API links check results =====\n");

  let hasMissing = false;

  for (const { docName, results, references } of allResults) {
    console.log(`\n${docName} directory:`);

    // log referenced files with or without detailed link information based on verbose flag
    console.log(`\nReferenced files${args.verbose ? " and links" : ""}:`);
    references.forEach((ref) => {
      console.log(
        `\n- ${ref.filePath} (${ref.links.length} links)${args.verbose ? ":" : ""}`,
      );

      // Only show detailed links in verbose mode
      if (args.verbose) {
        // Group links by API path for better readability
        const linksByPath = new Map<string, ApiLink[]>();

        ref.links.forEach((link) => {
          const pathParts = link.apiPath.split("/");
          const dirPath =
            pathParts.length > 1
              ? pathParts.slice(0, -1).join("/")
              : pathParts[0];

          if (!linksByPath.has(dirPath)) {
            linksByPath.set(dirPath, []);
          }
          linksByPath.get(dirPath)?.push(link);
        });

        // Display links grouped by directory
        for (const [dirPath, links] of linksByPath.entries()) {
          console.log(`  ${dirPath}/`);
          links.forEach((link) => {
            console.log(`    - ${link.text} (${link.name})`);
          });
        }
      }
    });

    // log check results
    console.log(`\nCheck results:`);
    for (const result of results) {
      console.log(`\n${result.type}:`);
      console.log(`- total: ${result.total}`);
      console.log(`- found: ${result.found}`);
      console.log(`- missing: ${result.missing.length}`);

      if (result.missing.length > 0) {
        hasMissing = true;
        // list missing docs
        console.log("\nMissing docs:");
        result.missing.forEach((name) => console.log(`  - ${name}`));
      }
    }

    console.log("\n---");
  }

  // Summary
  console.log("\n===== Summary =====");
  if (hasMissing) {
    // log missing message
    console.log(
      "Missing docs, please check the list above and create the corresponding document files.",
    );
    process.exit(1);
  } else {
    // log success message
    console.log("All API links have corresponding document files.");
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
