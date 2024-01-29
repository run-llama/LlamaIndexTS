import { z } from "zod";
import { OpenAI } from "llamaindex";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const openai = new OpenAI();

export const postRouter = createTRPCRouter({
  ask: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      const response = await openai.chat({
        stream: false,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant",
          },
          {
            role: "user",
            content: input.text,
          },
        ],
      });
      return {
        text: response.message.content,
      };
    }),
});
