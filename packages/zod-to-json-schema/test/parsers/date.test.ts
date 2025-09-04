import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseDateDef } from "../../src/parsers/date.js";
import { getRefs } from "../../src/Refs.js";
import { errorReferences } from "./errorReferences.js";
import { suite } from "../suite.js";

suite("Date validations", (test) => {
  test("should be possible to date as a string type", (assert) => {
    const zodDateSchema = z.date();
    const parsedSchemaWithOption = parseDateDef(
      zodDateSchema._def,
      getRefs({ dateStrategy: "string" }),
    );
    const parsedSchemaFromDefault = parseDateDef(zodDateSchema._def, getRefs());

    const jsonSchema: JSONSchema7Type = {
      type: "string",
      format: "date-time",
    };

    assert(parsedSchemaWithOption, jsonSchema);
    assert(parsedSchemaFromDefault, jsonSchema);
  });

  test("should be possible to describe date (openApi3)", (assert) => {
    const zodDateSchema = z.date();
    const parsedSchema = parseDateDef(
      zodDateSchema._def,
      getRefs({ dateStrategy: "integer", target: "openApi3" }),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "integer",
      format: "unix-time",
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to describe minimum date", (assert) => {
    const zodDateSchema = z
      .date()
      .min(new Date("1970-01-02"), { message: "Too old" });
    const parsedSchema = parseDateDef(
      zodDateSchema._def,
      getRefs({ dateStrategy: "integer" }),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "integer",
      format: "unix-time",
      minimum: 86400000,
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to describe maximum date", (assert) => {
    const zodDateSchema = z.date().max(new Date("1970-01-02"));
    const parsedSchema = parseDateDef(
      zodDateSchema._def,
      getRefs({ dateStrategy: "integer" }),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "integer",
      format: "unix-time",
      maximum: 86400000,
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to describe both maximum and minimum date", (assert) => {
    const zodDateSchema = z
      .date()
      .min(new Date("1970-01-02"))
      .max(new Date("1972-01-02"));
    const parsedSchema = parseDateDef(
      zodDateSchema._def,
      getRefs({ dateStrategy: "integer" }),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "integer",
      format: "unix-time",
      minimum: 86400000,
      maximum: 63158400000,
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should include custom error message for both maximum and minimum if they're passed", (assert) => {
    const minimumErrorMessage = "To young";
    const maximumErrorMessage = "To old";
    const zodDateSchema = z
      .date()
      .min(new Date("1970-01-02"), minimumErrorMessage)
      .max(new Date("1972-01-02"), maximumErrorMessage);

    const parsedSchema = parseDateDef(
      zodDateSchema._def,
      errorReferences({ dateStrategy: "integer" }),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "integer",
      format: "unix-time",
      minimum: 86400000,
      maximum: 63158400000,
      errorMessage: {
        minimum: minimumErrorMessage,
        maximum: maximumErrorMessage,
      },
    };

    assert(parsedSchema, jsonSchema);
  });

  test("multiple choices of strategy should result in anyOf", (assert) => {
    const zodDateSchema = z.date();
    const parsedSchema = parseDateDef(
      zodDateSchema._def,
      getRefs({ dateStrategy: ["format:date-time", "format:date", "integer"] }),
    );

    const jsonSchema: JSONSchema7Type = {
      anyOf: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "string",
          format: "date",
        },
        {
          type: "integer",
          format: "unix-time",
        },
      ],
    };

    assert(parsedSchema, jsonSchema);
  });
});
