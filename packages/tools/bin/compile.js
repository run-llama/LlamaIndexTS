import { execSync } from "child_process";
import { readdirSync } from "fs";

// get list of tools from folder names inside assembly folder
const tools = readdirSync("assembly").filter((dir) => !dir.includes("."));

// loop through each tool, compile it to wasm and verify it
tools.forEach((tool) => {
  try {
    execSync(
      `asc assembly/${tool}/index.ts -o dist/${tool}.wasm -t dist/${tool}.wat --exportRuntime --transform as-bind --target release`,
    );
  } catch (error) {
    console.error(`Error compiling module ${tool}:`, error.message);
    process.exit(1);
  }
});
