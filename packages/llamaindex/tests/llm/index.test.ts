import { setEnvs } from "@llamaindex/env";
import { Anthropic } from "llamaindex";
import { beforeAll, describe, expect, test } from "vitest";

beforeAll(() => {
  setEnvs({
    ANTHROPIC_API_KEY: "valid",
  });
});

describe("Anthropic llm", () => {
  test("format messages", () => {
    const anthropic = new Anthropic();
    expect(
      anthropic.formatMessages([
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
      ]),
    ).toEqual([
      {
        content: "You are a helpful assistant.",
        role: "assistant",
      },
      {
        content: "Hello?",
        role: "user",
      },
    ]);

    expect(
      anthropic.formatMessages([
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
        {
          content: "I am a system message.",
          role: "system",
        },
        {
          content: "What is your name?",
          role: "user",
        },
      ]),
    ).toEqual([
      {
        content: "You are a helpful assistant.",
        role: "assistant",
      },
      {
        content: "Hello?\nWhat is your name?",
        role: "user",
      },
    ]);

    expect(
      anthropic.formatMessages([
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: [
            {
              text: "What do you see in the image?",
              type: "text",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCAAgACADASIAAhEBAxEB/8QAGAABAAMBAAAAAAAAAAAAAAAACAQHCQb/xAAvEAABAgUCBAUDBQEAAAAAAAACAQMEBQYHERIhAAgTYSIxMkJxI2KCFBVBUVKh/8QAGAEAAwEBAAAAAAAAAAAAAAAAAwQFAQL/xAAnEQABBAECAwkAAAAAAAAAAAACAQMEEQAFMiExYRITFCJBcXKBof/aAAwDAQACEQMRAD8Aufmb5mnbWREFRdvIMZ3cWcaBh2NHUGEFwtIKQp63CX0h+S7YQgRzGSq6kgqGAS8NQRc6fmkIMWwSxJEyP+m0bwggQr5iIom6KnnxXty61jK+uJUVUxzxm/M5g5EASr6G9WGwTsIIIp2FOHJfi0kyvzS9Cv0zGwEF+2whOAUY4a6mnm2lREURLPoTggNG5tS6xpmOT4GQptwNUZc6sbexzcZRVSTKTOgudMPEL0j7E2uQNOxIqcaYcqXNaxe2HKnauBiAraDZ6n0k0tTBpPNwE9pptqDP3DtlBC1Q8qNw5K4AwLEunYkWMwcYg6fnqoH/ADPHA2/qeZWquhJJ3pODmEhmg/qGl2XAloebL5HWK/K8dOMOM7xVPfJrMhmQiq0SFXOlyPc+jIq3lwakpeYNq27K491kfvbzls07ECiSdlThhWKvj1LLx0VVLWGqSBuFJ1jc3WBEUb8K4TUieHz3xni7ea3lSZvZDhUVImxAVtBso39VdLUe0nk2a+0030n+K7YUc95/J66tRIp3SVXUpGyUI7wvPxDBoJ/UaLIuIqtuInRwiiqp4z3XbBYr3cGp9P30zJXiSjk1HLsqdIvxvzV1q8ZtB3ppa5bkwZkDz7LsF09Qxgi0Roa6UUU1LnxYH5JP74D1LUjNrkXigabc6kZM5vPFZi3NPi3dVXnFT+EQUM17IvEi1tL1xUkcEHb+lo6duvRUO644wwSDpaPWgG7sAApIKqqqm4jvxo1yvcrjdoTiqtrQ2I+u5nr19ItbUA2a5IAX3GvuP8U2ypMS5pSwFC5peTtM0lnSkMWVVUJb48a+8//Z`,
              },
            },
          ],
          role: "user",
        },
      ]),
    ).toEqual([
      {
        content: "You are a helpful assistant.",
        role: "assistant",
      },
      {
        content: [
          {
            text: "What do you see in the image?",
            type: "text",
          },
          {
            source: {
              data: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCAAgACADASIAAhEBAxEB/8QAGAABAAMBAAAAAAAAAAAAAAAACAQHCQb/xAAvEAABAgUCBAUDBQEAAAAAAAACAQMEBQYHERIhAAgTYSIxMkJxI2KCFBVBUVKh/8QAGAEAAwEBAAAAAAAAAAAAAAAAAwQFAQL/xAAnEQABBAECAwkAAAAAAAAAAAACAQMEEQAFMiExYRITFCJBcXKBof/aAAwDAQACEQMRAD8Aufmb5mnbWREFRdvIMZ3cWcaBh2NHUGEFwtIKQp63CX0h+S7YQgRzGSq6kgqGAS8NQRc6fmkIMWwSxJEyP+m0bwggQr5iIom6KnnxXty61jK+uJUVUxzxm/M5g5EASr6G9WGwTsIIIp2FOHJfi0kyvzS9Cv0zGwEF+2whOAUY4a6mnm2lREURLPoTggNG5tS6xpmOT4GQptwNUZc6sbexzcZRVSTKTOgudMPEL0j7E2uQNOxIqcaYcqXNaxe2HKnauBiAraDZ6n0k0tTBpPNwE9pptqDP3DtlBC1Q8qNw5K4AwLEunYkWMwcYg6fnqoH/ADPHA2/qeZWquhJJ3pODmEhmg/qGl2XAloebL5HWK/K8dOMOM7xVPfJrMhmQiq0SFXOlyPc+jIq3lwakpeYNq27K491kfvbzls07ECiSdlThhWKvj1LLx0VVLWGqSBuFJ1jc3WBEUb8K4TUieHz3xni7ea3lSZvZDhUVImxAVtBso39VdLUe0nk2a+0030n+K7YUc95/J66tRIp3SVXUpGyUI7wvPxDBoJ/UaLIuIqtuInRwiiqp4z3XbBYr3cGp9P30zJXiSjk1HLsqdIvxvzV1q8ZtB3ppa5bkwZkDz7LsF09Qxgi0Roa6UUU1LnxYH5JP74D1LUjNrkXigabc6kZM5vPFZi3NPi3dVXnFT+EQUM17IvEi1tL1xUkcEHb+lo6duvRUO644wwSDpaPWgG7sAApIKqqqm4jvxo1yvcrjdoTiqtrQ2I+u5nr19ItbUA2a5IAX3GvuP8U2ypMS5pSwFC5peTtM0lnSkMWVVUJb48a+8//Z",
              media_type: "image/jpeg",
              type: "base64",
            },
            type: "image",
          },
        ],
        role: "user",
      },
    ]);
  });
});
