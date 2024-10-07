import { UUIDFromString } from "@llamaindex/core/utils";
import { describe, expect, it } from "vitest";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("UUIDFromString", () => {
  it("should convert string to UUID", () => {
    const string = "document_id_1";
    const result = UUIDFromString(string);
    expect(result).toBeDefined();
    expect(result).toMatch(UUID_REGEX);
  });

  it("should return the same UUID for the same input string", () => {
    const string = "document_id_1";
    const result1 = UUIDFromString(string);
    const result2 = UUIDFromString(string);
    expect(result1).toEqual(result2);
  });

  it("should return the different UUID for different input strings", () => {
    const string1 = "document_id_1";
    const string2 = "document_id_2";
    const result1 = UUIDFromString(string1);
    const result2 = UUIDFromString(string2);
    expect(result1).not.toEqual(result2);
  });

  it("should handle case-sensitive input strings", () => {
    const string1 = "document_id_1";
    const string2 = "Document_Id_1";
    const result1 = UUIDFromString(string1);
    const result2 = UUIDFromString(string2);
    expect(result1).not.toEqual(result2);
  });
});
