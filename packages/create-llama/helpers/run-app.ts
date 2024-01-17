import { ChildProcess, exec } from "child_process";
import path from "path";
import { cyan, red } from "picocolors";

const pythonAppCMD = "poetry run uvicorn main:app --host=0.0.0.0 --port=$PORT";
const tsAppCMD = "npm run dev";
const frontendPort = 3000;
const backendPort = 8000; // External port

/**
 * Callback to show log from child process
 */
const addLogCallback = (cp: ChildProcess, log_prefix: string) => {
  cp.stdout?.on("data", (data) => {
    console.log(`${log_prefix}: ${data.toString()}`);
  });
  cp.stderr?.on("data", (data) => {
    console.error(red(`${log_prefix}: ${data.toString()}`));
  });
  cp.on("close", (code) => {
    console.log(cyan(`Child process exited with code ${code}`));
  });
};

export async function runApp(
  appPath: string,
  frontend: boolean,
  framework: string,
  externalPort?: number,
): Promise<ChildProcess[]> {
  const cps: ChildProcess[] = [];
  let backendCommand = "";
  if (framework === "fastapi") {
    backendCommand = pythonAppCMD;
  } else {
    backendCommand = tsAppCMD;
  }

  try {
    if (frontend) {
      cps.push(
        await createAppInProcess(
          backendCommand,
          path.join(appPath, "backend"),
          externalPort || backendPort,
          "backend",
        ),
      );
      cps.push(
        await createAppInProcess(
          tsAppCMD,
          path.join(appPath, "frontend"),
          frontendPort,
          "frontend",
        ),
      );
    } else {
      cps.push(
        await createAppInProcess(
          backendCommand,
          appPath,
          externalPort || backendPort,
          "backend",
        ),
      );
    }
  } catch (e) {
    cps.forEach((cp) => cp.kill());
    throw e;
  }
  return cps;
}

async function createAppInProcess(
  command: string,
  cwd: string,
  port: number,
  log_prefix: string,
) {
  const cp = exec(command, { cwd, env: { ...process.env, PORT: `${port}` } });
  if (!cp) throw new Error(`Can't start process ${command} in ${cwd}`);
  addLogCallback(cp, log_prefix);
  return cp;
}
