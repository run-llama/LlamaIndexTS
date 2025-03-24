/*
 * Copyright 2023 FoundryLabs, Inc.
 * Portions of this file are copied from the e2b project (https://github.com/e2b-dev/ai-artifacts)
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ExecutionError, Result, Sandbox } from "@e2b/code-interpreter";
import fs from "node:fs/promises";
import path from "node:path";
import { saveDocument } from "../chat/llamaindex/documents/helper";

type CodeArtifact = {
  commentary: string;
  template: string;
  title: string;
  description: string;
  additional_dependencies: string[];
  has_additional_dependencies: boolean;
  install_dependencies_command: string;
  port: number | null;
  file_path: string;
  code: string;
  files?: string[];
};

const sandboxTimeout = 10 * 60 * 1000; // 10 minute in ms

export const maxDuration = 60;

const OUTPUT_DIR = path.join("output", "tools");

export type ExecutionResult = {
  template: string;
  stdout: string[];
  stderr: string[];
  runtimeError?: ExecutionError;
  outputUrls: Array<{ url: string; filename: string }>;
  url: string;
};

// see https://github.com/e2b-dev/fragments/tree/main/sandbox-templates
const SUPPORTED_TEMPLATES = [
  "nextjs-developer",
  "vue-developer",
  "streamlit-developer",
  "gradio-developer",
];

export async function POST(req: Request) {
  const { artifact }: { artifact: CodeArtifact } = await req.json();

  let sbx: Sandbox;
  const sandboxOpts = {
    metadata: { template: artifact.template, userID: "default" },
    timeoutMs: sandboxTimeout,
  };
  if (SUPPORTED_TEMPLATES.includes(artifact.template)) {
    sbx = await Sandbox.create(artifact.template, sandboxOpts);
  } else {
    sbx = await Sandbox.create(sandboxOpts);
  }
  console.log("Created sandbox", sbx.sandboxId);

  // Install packages
  if (artifact.has_additional_dependencies) {
    await sbx.commands.run(artifact.install_dependencies_command);
    console.log(
      `Installed dependencies: ${artifact.additional_dependencies.join(", ")} in sandbox ${sbx.sandboxId}`,
    );
  }

  // Copy files
  if (artifact.files) {
    artifact.files.forEach(async (sandboxFilePath) => {
      const fileName = path.basename(sandboxFilePath);
      const localFilePath = path.join("output", "uploaded", fileName);
      const fileContent = await fs.readFile(localFilePath);

      const arrayBuffer = new Uint8Array(fileContent).buffer;
      await sbx.files.write(sandboxFilePath, arrayBuffer);
      console.log(`Copied file to ${sandboxFilePath} in ${sbx.sandboxId}`);
    });
  }

  // Copy code to fs
  if (artifact.code && Array.isArray(artifact.code)) {
    artifact.code.forEach(async (file) => {
      await sbx.files.write(file.file_path, file.file_content);
      console.log(`Copied file to ${file.file_path} in ${sbx.sandboxId}`);
    });
  } else {
    await sbx.files.write(artifact.file_path, artifact.code);
    console.log(`Copied file to ${artifact.file_path} in ${sbx.sandboxId}`);
  }

  // Execute code or return a URL to the running sandbox
  if (artifact.template === "code-interpreter-multilang") {
    const result = await sbx.runCode(artifact.code || "");
    await sbx.kill();
    const outputUrls = await downloadCellResults(result.results);
    return new Response(
      JSON.stringify({
        template: artifact.template,
        stdout: result.logs.stdout,
        stderr: result.logs.stderr,
        runtimeError: result.error,
        outputUrls: outputUrls,
      }),
    );
  } else {
    return new Response(
      JSON.stringify({
        template: artifact.template,
        url: `https://${sbx?.getHost(artifact.port || 80)}`,
      }),
    );
  }
}

async function downloadCellResults(
  cellResults?: Result[],
): Promise<Array<{ url: string; filename: string }>> {
  if (!cellResults) return [];

  const results = await Promise.all(
    cellResults.map(async (res) => {
      const formats = res.formats(); // available formats in the result
      const formatResults = await Promise.all(
        formats
          .filter((ext) => ["png", "svg", "jpeg", "pdf"].includes(ext))
          .map(async (ext) => {
            const filename = `${crypto.randomUUID()}.${ext}`;
            const base64 = res[ext as keyof Result];
            const buffer = Buffer.from(base64, "base64");
            const fileurl = await saveDocument(
              path.join(OUTPUT_DIR, filename),
              buffer,
            );
            return { url: fileurl, filename };
          }),
      );
      return formatResults;
    }),
  );
  return results.flat();
}
