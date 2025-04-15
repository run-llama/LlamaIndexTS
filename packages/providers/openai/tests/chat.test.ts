import { describe, expect, it } from "vitest";
import { z } from "zod";
import { OpenAI } from "../src/llm";

const API_KEY = process.env.OPENAI_API_KEY;

describe("OpenAI Chat Tests", () => {
  if (!API_KEY) {
    describe.skip("OpenAI API key not found skipping tests");
    return;
  }

  describe("responseFormat with Zod schema", () => {
    it("should handle zod schema as responseFormat", async () => {
      // Define a zod schema for the response format
      const exampleSchema = z.object({
        name: z.string(),
      });

      const llm = new OpenAI({
        model: "gpt-4o-mini",
        apiKey: API_KEY,
      });

      // Call the chat method with the zod schema as responseFormat
      const response = await llm.chat({
        messages: [
          {
            role: "user",
            content: "Extract my name: Bernd",
          },
        ],
        responseFormat: exampleSchema,
      });

      // Verify the response
      expect(response.message.content).toBeDefined();

      // Parse the response content as JSON
      const parsedContent = JSON.parse(response.message.content as string);

      // Verify the structure matches our schema
      expect(parsedContent).toHaveProperty("name");
    });
  });
});
