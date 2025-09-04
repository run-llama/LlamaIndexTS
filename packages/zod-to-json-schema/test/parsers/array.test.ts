import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseArrayDef } from "../../src/parsers/array.js";
import { getRefs } from "../../src/Refs.js";
import { errorReferences } from "./errorReferences.js";
import deref from "local-ref-resolver";
import { suite } from "../suite.js";

suite("Arrays and array validations", (test) => {
  test("should be possible to describe a simple array", (assert) => {
    const parsedSchema = parseArrayDef(z.array(z.string())._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      items: {
        type: "string",
      },
    };
    assert(parsedSchema, jsonSchema);
  });
  test("should be possible to describe a simple array with any item", (assert) => {
    const parsedSchema = parseArrayDef(z.array(z.any())._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "array",
    };
    assert(parsedSchema, jsonSchema);
  });
  test("should be possible to describe a string array with a minimum and maximum length", (assert) => {
    const parsedSchema = parseArrayDef(
      z.array(z.string()).min(2).max(4)._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      items: {
        type: "string",
      },
      minItems: 2,
      maxItems: 4,
    };
    assert(parsedSchema, jsonSchema);
  });
  test("should be possible to describe a string array with an exect length", (assert) => {
    const parsedSchema = parseArrayDef(
      z.array(z.string()).length(5)._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      items: {
        type: "string",
      },
      minItems: 5,
      maxItems: 5,
    };
    assert(parsedSchema, jsonSchema);
  });
  test("should be possible to describe a string array with a minimum length of 1 by using nonempty", (assert) => {
    const parsedSchema = parseArrayDef(
      z.array(z.any()).nonempty()._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      minItems: 1,
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible do properly reference array items", (assert) => {
    const willHaveBeenSeen = z.object({ hello: z.string() });
    const unionSchema = z.union([willHaveBeenSeen, willHaveBeenSeen]);
    const arraySchema = z.array(unionSchema);
    const jsonSchema = parseArrayDef(arraySchema._def, getRefs());
    //TODO: Remove 'any'-cast when json schema type package supports it. 'anyOf' in 'items' should be completely according to spec though.
    assert((jsonSchema.items as any).anyOf[1].$ref, "#/items/anyOf/0");

    const resolvedSchema = deref(jsonSchema);
    assert(resolvedSchema.items.anyOf[1] === resolvedSchema.items.anyOf[0]);
  });

  test("should include custom error messages for minLength and maxLength", (assert) => {
    const minLengthMessage = "Must have at least 5 items.";
    const maxLengthMessage = "Can have at most 10 items.";
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      minItems: 5,
      maxItems: 10,
      errorMessage: {
        minItems: minLengthMessage,
        maxItems: maxLengthMessage,
      },
    };
    const zodArraySchema = z
      .array(z.any())
      .min(5, minLengthMessage)
      .max(10, maxLengthMessage);
    const jsonParsedSchema = parseArrayDef(
      zodArraySchema._def,
      errorReferences(),
    );
    assert(jsonSchema, jsonParsedSchema);
  });
  test("should include custom error messages for exactLength", (assert) => {
    const exactLengthMessage = "Must have exactly 5 items.";
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      minItems: 5,
      maxItems: 5,
      errorMessage: {
        minItems: exactLengthMessage,
        maxItems: exactLengthMessage,
      },
    };
    const zodArraySchema = z.array(z.any()).length(5, exactLengthMessage);
    const jsonParsedSchema = parseArrayDef(
      zodArraySchema._def,
      errorReferences(),
    );
    assert(jsonSchema, jsonParsedSchema);
  });

  test("should not include errorMessages property if none are passed", (assert) => {
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      minItems: 5,
      maxItems: 10,
    };
    const zodArraySchema = z.array(z.any()).min(5).max(10);
    const jsonParsedSchema = parseArrayDef(
      zodArraySchema._def,
      errorReferences(),
    );
    assert(jsonSchema, jsonParsedSchema);
  });
  test("should not include error messages if it isn't explicitly set to true in References constructor", (assert) => {
    const zodSchemas = [
      z.array(z.any()).min(1, "bad"),
      z.array(z.any()).max(1, "bad"),
    ];
    for (const schema of zodSchemas) {
      const jsonParsedSchema = parseArrayDef(schema._def, getRefs());
      assert(jsonParsedSchema.errorMessages, undefined);
    }
  });
});
