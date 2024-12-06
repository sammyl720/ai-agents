import { z } from 'zod';

// Extend the jsonSchema definition with optional "description"
const jsonSchema: z.ZodTypeAny = z.lazy(() =>
	z.object({
		$schema: z.string().optional(),
		$id: z.string().optional(),
		$ref: z.string().optional(),

		type: z
			.union([
				z.literal('string'),
				z.literal('number'),
				z.literal('integer'),
				z.literal('boolean'),
				z.literal('null'),
				z.literal('object'),
				z.literal('array'),
			])
			.optional(),
		properties: z.record(jsonSchema).optional(),
		items: z.union([jsonSchema, z.array(jsonSchema)]).optional(),
		required: z.array(z.string()).optional(),
		additionalProperties: z.union([z.boolean(), jsonSchema]).optional(),
		description: z.string().optional(),
	}),
);

export const schemaWithProperties = z.object({
	properties: z.record(jsonSchema),
});

// Now create a parser for the function definition.
// The `parameters` field is a JSON Schema object.
export const functionDefinitionSchema = z.object({
	type: z.literal('function'),
	function: z.object({
		name: z.string(),
		description: z.string(),
		parameters: jsonSchema,
	}),
});
