import { execSync } from "child_process";
import { mkdirSync, readdirSync } from "fs";

const WASM_SRC_FOLDER = "wasm";
const WASM_OUTPUT_FOLDER = "dist/wasm";

// get list of tools from folder names inside assembly folder
const tools = readdirSync(WASM_SRC_FOLDER).filter((dir) => !dir.includes("."));

// create dist/wasm folder if it doesn't exist using fs
try {
  mkdirSync(WASM_OUTPUT_FOLDER, { recursive: true });
} catch (error) {
  console.error("Error creating dist/wasm folder:", error.message);
  process.exit(1);
}

// loop through each tool, compile it to wasm using extism-js
tools.forEach((tool) => {
  try {
    execSync(
      `extism-js ${WASM_SRC_FOLDER}/${tool}/${tool}.js -i ${WASM_SRC_FOLDER}/${tool}/${tool}.d.ts -o ${WASM_OUTPUT_FOLDER}/${tool}.wasm`,
    );
  } catch (error) {
    console.error(`Error compiling module ${tool}:`, error.message);
    process.exit(1);
  }
});
