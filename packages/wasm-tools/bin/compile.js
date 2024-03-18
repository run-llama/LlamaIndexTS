import { execSync } from "child_process";
import { readdirSync } from "fs";

// get list of tools from folder names inside assembly folder
const tools = readdirSync("assembly").filter((dir) => !dir.includes("."));

// loop through each tool, compile it to wasm and verify it
tools.forEach((tool) => {
  try {
    execSync(
      `asc assembly/${tool}/index.ts -b dist/${tool}.wasm -t dist/${tool}.wat --exportRuntime --sourceMap --optimize`,
    );
  } catch (error) {
    console.error(`Error compiling module ${tool}:`, error.message);
    process.exit(1);
  }
});
