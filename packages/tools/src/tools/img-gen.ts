import { tool } from "@llamaindex/core/tools";
import { FormData } from "formdata-node";
import fs from "fs";
import got from "got";
import crypto from "node:crypto";
import path from "node:path";
import { Readable } from "stream";
import { z } from "zod";

export type ImgGeneratorToolOutput = {
  isSuccess: boolean;
  imageUrl?: string;
  errorMessage?: string;
};

export type ImgGeneratorToolParams = {
  outputFormat?: string;
  outputDir?: string;
  apiKey?: string;
  fileServerURLPrefix?: string;
};

// Constants
const IMG_OUTPUT_FORMAT = "webp";
const IMG_OUTPUT_DIR = "output/tools";
const IMG_GEN_API =
  "https://api.stability.ai/v2beta/stable-image/generate/core";

// Helper functions
function checkRequiredEnvVars() {
  if (!process.env.STABILITY_API_KEY) {
    throw new Error(
      "STABILITY_API_KEY key is required to run image generator. Get it here: https://platform.stability.ai/account/keys",
    );
  }
  if (!process.env.FILESERVER_URL_PREFIX) {
    throw new Error(
      "FILESERVER_URL_PREFIX is required to display file output after generation",
    );
  }
}

async function promptToImgBuffer(
  prompt: string,
  apiKey: string,
): Promise<Buffer> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", IMG_OUTPUT_FORMAT);

  const buffer = await got
    .post(IMG_GEN_API, {
      body: form as unknown as Buffer | Readable | string,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/*",
      },
    })
    .buffer();

  return buffer;
}

function saveImage(
  buffer: Buffer,
  options: {
    outputFormat?: string;
    outputDir?: string;
    fileServerURLPrefix?: string;
  },
): string {
  const {
    outputFormat = IMG_OUTPUT_FORMAT,
    outputDir = IMG_OUTPUT_DIR,
    fileServerURLPrefix = process.env.FILESERVER_URL_PREFIX,
  } = options;
  const filename = `${crypto.randomUUID()}.${outputFormat}`;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, buffer);

  const url = `${fileServerURLPrefix}/${outputDir}/${filename}`;
  console.log(`Saved image to ${outputPath}.\nURL: ${url}`);

  return url;
}

export const imageGenerator = (params?: ImgGeneratorToolParams) => {
  return tool({
    name: "image_generator",
    description: "Use this function to generate an image based on the prompt.",
    parameters: z.object({
      prompt: z.string().describe("The prompt to generate the image"),
    }),
    execute: async ({ prompt }): Promise<ImgGeneratorToolOutput> => {
      const outputFormat = params?.outputFormat ?? IMG_OUTPUT_FORMAT;
      const outputDir = params?.outputDir ?? IMG_OUTPUT_DIR;
      const apiKey = params?.apiKey ?? process.env.STABILITY_API_KEY;
      const fileServerURLPrefix =
        params?.fileServerURLPrefix ?? process.env.FILESERVER_URL_PREFIX;

      if (!apiKey) {
        throw new Error(
          "STABILITY_API_KEY key is required to run image generator. Get it here: https://platform.stability.ai/account/keys",
        );
      }
      if (!fileServerURLPrefix) {
        throw new Error(
          "FILESERVER_URL_PREFIX is required to display file output after generation",
        );
      }

      try {
        const buffer = await promptToImgBuffer(prompt, apiKey);
        const imageUrl = saveImage(buffer, {
          outputFormat,
          outputDir,
          fileServerURLPrefix,
        });
        return { isSuccess: true, imageUrl };
      } catch (error) {
        console.error(error);
        return {
          isSuccess: false,
          errorMessage: "Failed to generate image. Please try again.",
        };
      }
    },
  });
};
