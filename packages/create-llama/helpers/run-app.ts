import { ChildProcess, spawn } from "child_process";
import { log } from "console";
import path from "path";
import { TemplateFramework } from "./types";

const frontendPort = 3000;
const backendPort = 8000; // External port

export async function runApp(
  appPath: string,
  frontend: boolean,
  framework: TemplateFramework,
  externalPort?: number,
): Promise<void> {
  let backendAppProcess: ChildProcess;
  let frontendAppProcess: ChildProcess | undefined;
  // Callback to kill app processes
  const killAppProcesses = () => {
    log("Killing app processes...");
    backendAppProcess.kill();
    frontendAppProcess?.kill();
  };
  process.on("exit", () => {
    killAppProcesses();
  });

  let backendCommand = "";
  let backendArgs: string[];
  if (framework === "fastapi") {
    backendCommand = "poetry";
    backendArgs = [
      "run",
      "uvicorn",
      "main:app",
      "--host=0.0.0.0",
      "--port=" + (externalPort || backendPort),
    ];
  } else {
    backendCommand = "npm";
    backendArgs = ["run", "dev"];
  }

  if (frontend) {
    await new Promise((resolve, reject) => {
      backendAppProcess = spawn(backendCommand, backendArgs, {
        stdio: "inherit",
        cwd: path.join(appPath, "backend"),
        env: { ...process.env, PORT: `${externalPort || backendPort}` },
      });
      frontendAppProcess = spawn("npm", ["run", "dev"], {
        stdio: "inherit",
        cwd: path.join(appPath, "frontend"),
        env: { ...process.env, PORT: `${frontendPort}` },
      });
    }).catch((err) => {
      console.error(err);
      killAppProcesses();
    });
  } else {
    await new Promise((resolve, reject) => {
      backendAppProcess = spawn(backendCommand, backendArgs, {
        stdio: "inherit",
        cwd: appPath,
        env: { ...process.env, PORT: `${externalPort || backendPort}` },
      });
    }).catch((err) => {
      console.log(err);
      killAppProcesses();
    });
  }
}
