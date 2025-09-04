import { JSONSchema7Type } from "json-schema";
import { parseBigintDef } from "../../src/parsers/bigint.js";
import { z } from "zod";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";
suite("bigint", (test) => {
  test("should be possible to use bigint", (assert) => {
    const parsedSchema = parseBigintDef(z.bigint()._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "integer",
      format: "int64",
    };
    assert(parsedSchema, jsonSchema);
  });

  // Jest doesn't like bigints. 🤷
  test("should be possible to define gt/lt", (assert) => {
    const parsedSchema = parseBigintDef(
      z.bigint().gte(BigInt(10)).lte(BigInt(20))._def,
      getRefs(),
    );
    const jsonSchema = {
      type: "integer",
      format: "int64",
      minimum: BigInt(10),
      maximum: BigInt(20),
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to define gt/lt (jsonSchema2019-09)", (assert) => {
    const parsedSchema = parseBigintDef(
      z.bigint().gte(BigInt(10)).lte(BigInt(20))._def,
      getRefs({
        target: "jsonSchema2019-09",
      }),
    );
    const jsonSchema = {
      type: "integer",
      format: "int64",
      minimum: BigInt(10),
      maximum: BigInt(20),
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to define gt/lt", (assert) => {
    const parsedSchema = parseBigintDef(
      z.bigint().gt(BigInt(10)).lt(BigInt(20))._def,
      getRefs(),
    );
    const jsonSchema = {
      type: "integer",
      format: "int64",
      exclusiveMinimum: BigInt(10),
      exclusiveMaximum: BigInt(20),
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to define gt/lt (jsonSchema2019-09)", (assert) => {
    const parsedSchema = parseBigintDef(
      z.bigint().gt(BigInt(10)).lt(BigInt(20))._def,
      getRefs({
        target: "jsonSchema2019-09",
      }),
    );
    const jsonSchema = {
      type: "integer",
      format: "int64",
      exclusiveMinimum: true,
      exclusiveMaximum: true,
      minimum: BigInt(10),
      maximum: BigInt(20),
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to define multipleOf", (assert) => {
    const parsedSchema = parseBigintDef(
      z.bigint().multipleOf(BigInt(5))._def,
      getRefs(),
    );
    const jsonSchema = {
      type: "integer",
      format: "int64",
      multipleOf: BigInt(5),
    };
    assert(parsedSchema, jsonSchema);
  });
});
