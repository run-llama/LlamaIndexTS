import { ChildProcess, SpawnOptions, spawn } from "child_process";
import path from "path";
import { TemplateFramework } from "./types";

const createProcess = (
  command: string,
  args: string[],
  options: SpawnOptions,
) => {
  return spawn(command, args, {
    ...options,
    shell: true,
  })
    .on("exit", function (code) {
      if (code !== 0) {
        console.log(`Child process exited with code=${code}`);
        process.exit(1);
      }
    })
    .on("error", function (err) {
      console.log("Error when running chill process: ", err);
      process.exit(1);
    });
};

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
  process.on("exit", () => {
    console.log("Killing app processes...");
    backendAppProcess.kill();
    frontendAppProcess?.kill();
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
      "--port=" + backendPort,
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
      backendAppProcess = createProcess(backendCommand, backendArgs, {
        stdio: "inherit",
        cwd: path.join(appPath, "backend"),
        env: { ...process.env, PORT: `${backendPort}` },
      });
      frontendAppProcess = createProcess("npm", ["run", "dev"], {
        stdio: "inherit",
        cwd: path.join(appPath, "frontend"),
        env: { ...process.env, PORT: `${frontendPort}` },
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      backendAppProcess = createProcess(backendCommand, backendArgs, {
        stdio: "inherit",
        cwd: path.join(appPath),
        env: { ...process.env, PORT: `${backendPort}` },
      });
    });
  }
}
