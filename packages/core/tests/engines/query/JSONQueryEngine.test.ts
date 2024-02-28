import { defaultOutputProcessor } from "llamaindex";
import { describe, expect, it } from "vitest";

describe("JSONQueryEngine", () => {
  const jsonValue = {
    blogPosts: [
      {
        id: 1,
        title: "First blog post",
        content: "This is my first blog post",
      },
      {
        id: 2,
        title: "Second blog post",
        content: "This is my second blog post",
      },
    ],
    comments: [
      {
        id: 1,
        content: "Nice post!",
        username: "jerry",
        blogPostId: 1,
      },
      {
        id: 2,
        content: "Interesting thoughts",
        username: "simon",
        blogPostId: 2,
      },
      {
        id: 3,
        content: "Loved reading this!",
        username: "simon",
        blogPostId: 2,
      },
    ],
  };

  it("should be able to output parse", async () => {
    const values = await defaultOutputProcessor({
      llmOutput: "$..comments[?(@.username=='simon')].content",
      jsonValue,
    });

    expect(values).toEqual([
      {
        content: "Interesting thoughts",
      },
      {
        content: "Loved reading this!",
      },
    ]);
  });

  it("should be able to output parse with extra strings", async () => {
    const values = await defaultOutputProcessor({
      llmOutput: "`$..comments[?(@.username=='simon')].content`",
      jsonValue,
    });

    expect(values).toEqual([
      {
        content: "Interesting thoughts",
      },
      {
        content: "Loved reading this!",
      },
    ]);
  });

  it("should be able to return a complete object", async () => {
    const object = await defaultOutputProcessor({
      llmOutput: "`$..comments[?(@.id=='1')]`",
      jsonValue,
    });

    expect(object).toEqual([
      {
        id: 1,
        content: "Nice post!",
        username: "jerry",
        blogPostId: 1,
      },
    ]);
  });
});
