import { execSync } from "child_process";

// npm run download add
const args = process.argv.slice(2);
const tool = args[0];

if (!tool) {
  console.error("Error: Please provide a module name.");
  process.exit(1);
}

try {
  execSync(
    `asc assembly/tools/${tool}/index.ts -o build/${tool}.D -t build/${tool}.wat --target release`,
  );
  console.log(`Module ${tool} downloaded successfully.`);
} catch (error) {
  console.error(`Error downloading module ${tool}:`, error.message);
  process.exit(1);
}
