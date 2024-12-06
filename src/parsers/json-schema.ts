import { z } from "zod";

export const jsonSchema: z.ZodTypeAny = z.lazy(() =>
  z.object({
    // Common JSON Schema properties
    $schema: z.string().optional(),
    $id: z.string().optional(),
    $ref: z.string().optional(),

    // Basic type validation
    type: z
      .union([
        z.literal("string"),
        z.literal("number"),
        z.literal("integer"),
        z.literal("boolean"),
        z.literal("null"),
        z.literal("object"),
        z.literal("array"),
      ])
      .optional(),

    // `properties` should be a record of string -> JSON Schema
    properties: z.record(jsonSchema).optional(),

    // `items` can be a single schema or an array of schemas
    items: z.union([jsonSchema, z.array(jsonSchema)]).optional(),

    // `required` should be an array of strings
    required: z.array(z.string()).optional(),

    // `additionalProperties` can be a boolean or another schema
    additionalProperties: z.union([z.boolean(), jsonSchema]).optional(),
  })
);

// Now define a schema that specifically checks an object with a `properties` field is valid:
export const schemaWithProperties = z.object({
  properties: z.record(jsonSchema),
});
