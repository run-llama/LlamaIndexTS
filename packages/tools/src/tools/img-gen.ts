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

async function promptToImgBuffer(prompt: string): Promise<Buffer> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", IMG_OUTPUT_FORMAT);

  const buffer = await got
    .post(IMG_GEN_API, {
      body: form as unknown as Buffer | Readable | string,
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "image/*",
      },
    })
    .buffer();

  return buffer;
}

function saveImage(buffer: Buffer): string {
  const filename = `${crypto.randomUUID()}.${IMG_OUTPUT_FORMAT}`;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(IMG_OUTPUT_DIR)) {
    fs.mkdirSync(IMG_OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(IMG_OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, buffer);

  const url = `${process.env.FILESERVER_URL_PREFIX}/${IMG_OUTPUT_DIR}/${filename}`;
  console.log(`Saved image to ${outputPath}.\nURL: ${url}`);

  return url;
}

export const imageGenerator = tool({
  name: "image_generator",
  description: "Use this function to generate an image based on the prompt.",
  parameters: z.object({
    prompt: z.string().describe("The prompt to generate the image"),
  }),
  execute: async ({ prompt }): Promise<ImgGeneratorToolOutput> => {
    // Check required environment variables
    checkRequiredEnvVars();

    try {
      const buffer = await promptToImgBuffer(prompt);
      const imageUrl = saveImage(buffer);
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
