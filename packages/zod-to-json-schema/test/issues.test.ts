import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema";
import { suite } from "./suite";
import Ajv from "ajv";
import errorMessages from "ajv-errors";

suite("Issue tests", (test) => {
  const ajv = errorMessages(new Ajv({ allErrors: true }));

  test("@158", (assert) => {
    const schema = z.object({
      test: z
        .string()
        .optional()
        .superRefine(async (value, ctx) => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (value === "fail") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "This is a test error",
            });
          }
        }),
    });

    const output = zodToJsonSchema(schema);

    const expected = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: { test: { type: "string" } },
      additionalProperties: false,
    };

    assert(output, expected)
    
  });

  test("@175", (assert) => {
    const schema = z.object({
      phoneNumber: z.number().optional(),
      name: z.string(),
      never: z.never().optional(),
      any: z.any().optional(),
    });

    const output = zodToJsonSchema(schema, { target: "openAi" });

    const expected = {
      $schema: "https://json-schema.org/draft/2019-09/schema#",
      type: "object",
      required: ["phoneNumber", "name", "any"],
      properties: {
        phoneNumber: { type: ["number", "null"] },
        name: { type: "string" },
        any: {
          $ref: "#/definitions/OpenAiAnyType",
        },
      },
      additionalProperties: false,
      definitions: {
        OpenAiAnyType: {
          type: ["string", "number", "integer", "boolean", "array", "null"],
          items: {
            $ref: "#/definitions/OpenAiAnyType",
          },
        },
      },
    };

    assert(output, expected);
  });

  test("@94", (assert) => {
    const topicSchema = z.object({
      topics: z
        .array(
          z.object({
            topic: z.string().describe("The topic of the position"),
          }),
        )
        .describe("An array of topics"),
    });

    const res = zodToJsonSchema(topicSchema);

    assert(res, {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      required: ["topics"],
      properties: {
        topics: {
          type: "array",
          items: {
            type: "object",
            required: ["topic"],
            properties: {
              topic: {
                type: "string",
                description: "The topic of the position",
              },
            },
            additionalProperties: false,
          },
          description: "An array of topics",
        },
      },
      additionalProperties: false,
    });
  });

  test("@154", (assert) => {
    const urlRegex =
      /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%,/.\w\-_]*)?\??(?:[-+=&;%@.\w:()_]*)#?(?:[.!/\\\w]*))?)/;

    const URLSchema = z
      .string()
      .min(1)
      .max(1000)
      .regex(urlRegex, { message: "Please enter a valid URL" })
      .brand("url");

    const jsonSchemaJs = zodToJsonSchema(URLSchema, { errorMessages: true });
    const jsonSchema = JSON.parse(JSON.stringify(jsonSchemaJs));

    // Basic conversion checks
    {
      const expected = {
        type: "string",
        minLength: 1,
        maxLength: 1000,
        pattern:
          "^((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[-;:&=+$,\\w]+@)?[A-Za-z0-9.-]+|(?:www\\.|[-;:&=+$,\\w]+@)[A-Za-z0-9.-]+)((?:\\/[+~%,/.\\w\\-_]*)?\\??(?:[-+=&;%@.\\w:()_]*)#?(?:[.!/\\\\\\w]*))?)",
        errorMessage: { pattern: "Please enter a valid URL" },
        $schema: "http://json-schema.org/draft-07/schema#",
      };

      assert(jsonSchema, expected);
    }

    // Ajv checks
    {
      const ajvSchema = ajv.compile(jsonSchema);

      // @ts-expect-error
      function assertAjvErrors(input: unknown, errorKeywords: string[] | null) {
        assert(ajvSchema(input), !errorKeywords);
        assert(ajvSchema.errors?.map((e) => e.keyword) ?? null, errorKeywords);
      }

      assertAjvErrors(
        "https://github.com/StefanTerdell/zod-to-json-schema/issues/154",
        null,
      );
      assertAjvErrors("", ["minLength", "errorMessage"]);
      assertAjvErrors("invalid url", ["errorMessage"]);
      assertAjvErrors(
        "http://www.ok-url-but-too-long.com/" + "x".repeat(1000),
        ["maxLength"],
      );
      assertAjvErrors("invalid url and too long" + "x".repeat(1000), [
        "maxLength",
        "errorMessage",
      ]);
    }
  });

  test("should be possible to use lazy recursion @162", (assert) => {
    const A: any = z.object({
      ref1: z.lazy(() => B),
    });

    const B = z.object({
      ref1: A,
    });

    const result = zodToJsonSchema(A);

    const expected = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        ref1: {
          type: "object",
          properties: {
            ref1: {
              $ref: "#",
            },
          },
          required: ["ref1"],
          additionalProperties: false,
        },
      },
      required: ["ref1"],
      additionalProperties: false,
    };

    assert(result, expected);
  });

  test("No additionalProperties @168", (assert) => {
    const extractedDataSchema = z
      .object({
        document_type: z.string().nullable().optional(),
        vendor: z
          .object({
            name: z.string().nullable().optional(),
            address: z.string().nullable().optional(),
            country: z.string().nullable().optional(),
            phone_number: z.string().nullable().optional(),
            website: z.string().nullable().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough();

    const expected = {
      type: "object",
      properties: {
        document_type: {
          type: "string",
          nullable: true,
        },
        vendor: {
          type: "object",
          properties: {
            name: {
              type: "string",
              nullable: true,
            },
            address: {
              type: "string",
              nullable: true,
            },
            country: {
              type: "string",
              nullable: true,
            },
            phone_number: {
              type: "string",
              nullable: true,
            },
            website: {
              type: "string",
              nullable: true,
            },
          },
        },
      },
    };

    // With passthrough:undefined
    {
      const aiResponseJsonSchema = zodToJsonSchema(extractedDataSchema, {
        target: "openApi3",
        removeAdditionalStrategy: "strict",
        allowedAdditionalProperties: undefined,
        strictUnions: true,
      });

      assert(aiResponseJsonSchema, expected);
    }

    // Using postProcess
    {
      const aiResponseJsonSchema = zodToJsonSchema(extractedDataSchema, {
        target: "openApi3",
        removeAdditionalStrategy: "passthrough",
        strictUnions: true,
        postProcess: (jsonSchema) =>
          jsonSchema &&
          Object.fromEntries(
            Object.entries(jsonSchema).filter(
              ([key]) => key !== "additionalProperties",
            ),
          ),
      });

      assert(aiResponseJsonSchema, expected);
    }
  });
});
