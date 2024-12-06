import { describe, it, expect } from "vitest";
import { schemaWithProperties } from "./index.js";

describe("schemaWithProperties Parser", () => {
  it("should pass for a valid schema with string and integer properties", () => {
    const input = {
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
      },
    };

    expect(() => schemaWithProperties.parse(input)).not.toThrow();
  });

  it("should pass for a nested object schema", () => {
    const input = {
      properties: {
        person: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                zip: { type: "string" },
              },
            },
          },
          required: ["firstName", "lastName"],
        },
      },
    };

    expect(() => schemaWithProperties.parse(input)).not.toThrow();
  });

  it("should fail if `properties` is not provided", () => {
    const input = {};
    expect(() => schemaWithProperties.parse(input)).toThrow();
  });

  it("should fail if a property has an invalid type", () => {
    const input = {
      properties: {
        invalidProp: { type: "strng" }, // misspelling "string"
      },
    };

    expect(() => schemaWithProperties.parse(input)).toThrow();
  });

  it("should handle arrays of items correctly", () => {
    const input = {
      properties: {
        tags: {
          type: "array",
          items: { type: "string" },
        },
      },
    };
    
    expect(() => schemaWithProperties.parse(input)).not.toThrow();
  });

  it("should fail if items are invalid in an array", () => {
    const input = {
      properties: {
        tags: {
          type: "array",
          items: { type: "strng" }, // invalid type again
        },
      },
    };

    expect(() => schemaWithProperties.parse(input)).toThrow();
  });

  it("should allow additionalProperties as boolean", () => {
    const input = {
      properties: {
        config: {
          type: "object",
          additionalProperties: true,
        },
      },
    };

    expect(() => schemaWithProperties.parse(input)).not.toThrow();
  });

  it("should allow additionalProperties as a schema", () => {
    const input = {
      properties: {
        config: {
          type: "object",
          additionalProperties: { type: "string" },
        },
      },
    };

    expect(() => schemaWithProperties.parse(input)).not.toThrow();
  });

  it("should fail when additionalProperties is an invalid type", () => {
    const input = {
      properties: {
        config: {
          type: "object",
          additionalProperties: { type: "strng" },
        },
      },
    };

    expect(() => schemaWithProperties.parse(input)).toThrow();
  });
});
