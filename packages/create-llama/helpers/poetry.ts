/* eslint-disable import/no-extraneous-dependencies */
import { execSync } from "child_process";
import fs from "fs";

export function isPoetryAvailable(): boolean {
  try {
    execSync("poetry --version", { stdio: "ignore" });
    return true;
  } catch (_) {}
  return false;
}

export function tryPoetryInstall(noRoot: boolean): boolean {
  try {
    execSync(`poetry install${noRoot ? " --no-root" : ""}`, {
      stdio: "inherit",
    });
    return true;
  } catch (_) {}
  return false;
}

export function tryPoetryRun(command: string): boolean {
  try {
    execSync(`poetry run ${command}`, { stdio: "inherit" });
    return true;
  } catch (_) {}
  return false;
}

export function isHavingPoetryLockFile(): boolean {
  try {
    return fs.existsSync("poetry.lock");
  } catch (_) {}
  return false;
}
