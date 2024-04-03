import { JSONQueryEngine } from "@llamaindex/experimental";

import { OpenAI, Settings } from "llamaindex";

// Update LLM
Settings.llm = new OpenAI({ model: "gpt-4" });

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

const jsonSchema = {
  type: "object",
  properties: {
    blogPosts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
          },
          title: {
            type: "string",
          },
          content: {
            type: "string",
          },
        },
        required: ["id", "title", "content"],
      },
    },
    comments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
          },
          content: {
            type: "string",
          },
          username: {
            type: "string",
          },
          blogPostId: {
            type: "number",
          },
        },
        required: ["id", "content", "username", "blogPostId"],
      },
    },
  },
  required: ["blogPosts", "comments"],
};

async function main() {
  const jsonQueryEngine = new JSONQueryEngine({
    jsonValue,
    jsonSchema,
  });

  const rawQueryEngine = new JSONQueryEngine({
    jsonValue,
    jsonSchema,
    synthesizeResponse: false,
  });

  const response = await jsonQueryEngine.query({
    query: "give to me the comment with id 1",
  });

  const rawResponse = await rawQueryEngine.query({
    query: "give me all simon comments",
  });

  console.log({ response });

  console.log({ rawResponse });
}

void main();
