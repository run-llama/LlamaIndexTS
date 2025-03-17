import { tool } from "@llamaindex/core/tools";
import { FormData } from "formdata-node";
import got from "got";
import path from "path";
import { Readable } from "stream";
import { z } from "zod";
import { getFileUrl, saveDocument } from "../helper";

export type ImgGeneratorToolOutput = {
  isSuccess: boolean;
  imageUrl?: string;
  errorMessage?: string;
};

export type ImgGeneratorToolParams = {
  /** Directory where generated images will be saved */
  outputDir: string;
  /** STABILITY_API_KEY key is required to run image generator. Get it here: https://platform.stability.ai/account/keys */
  apiKey: string;
  /** Output format of the generated image */
  outputFormat?: string;
  /** Prefix for the file server URL */
  fileServerURLPrefix?: string | undefined;
};

export const imageGenerator = (params: ImgGeneratorToolParams) => {
  return tool({
    name: "image_generator",
    description: "Use this function to generate an image based on the prompt.",
    parameters: z.object({
      prompt: z.string().describe("The prompt to generate the image"),
    }),
    execute: async ({ prompt }): Promise<ImgGeneratorToolOutput> => {
      const { outputDir, apiKey, fileServerURLPrefix } = params;
      const outputFormat = params.outputFormat ?? "webp";

      try {
        const buffer = await promptToImgBuffer(prompt, apiKey, outputFormat);
        const filename = `${crypto.randomUUID()}.${outputFormat}`;
        const filePath = path.join(outputDir, filename);
        await saveDocument(filePath, buffer);
        const imageUrl = getFileUrl(filePath, { fileServerURLPrefix });
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

async function promptToImgBuffer(
  prompt: string,
  apiKey: string,
  outputFormat: string,
): Promise<Buffer> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", outputFormat);

  const apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/core";
  const buffer = await got
    .post(apiUrl, {
      body: form as unknown as Buffer | Readable | string,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/*",
      },
    })
    .buffer();

  return buffer;
}
