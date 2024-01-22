import { ChildProcess, spawn } from "child_process";
import { log } from "console";
import path from "path";
import { TemplateFramework } from "./types";

// eslint-disable-next-line max-params
export async function runApp(
  appPath: string,
  frontend: boolean,
  framework: TemplateFramework,
  port?: number,
  externalPort?: number,
): Promise<any> {
  let backendAppProcess: ChildProcess;
  let frontendAppProcess: ChildProcess | undefined;
  let frontendPort = port || 3000;
  let backendPort = externalPort || 8000;

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
  } else if (framework === "nextjs") {
    backendCommand = "npm";
    backendArgs = ["run", "dev"];
    backendPort = frontendPort;
  } else {
    backendCommand = "npm";
    backendArgs = ["run", "dev"];
  }

  if (frontend) {
    return new Promise((resolve, reject) => {
      backendAppProcess = spawn(backendCommand, backendArgs, {
        stdio: "inherit",
        cwd: path.join(appPath, "backend"),
        env: { ...process.env, PORT: `${backendPort}` },
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
    return new Promise((resolve, reject) => {
      backendAppProcess = spawn(backendCommand, backendArgs, {
        stdio: "inherit",
        cwd: appPath,
        env: { ...process.env, PORT: `${backendPort}` },
      });
    }).catch((err) => {
      console.log(err);
      killAppProcesses();
    });
  }
}
