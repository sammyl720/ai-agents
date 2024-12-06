import { describe, it, expect } from 'vitest';
import { functionDefinitionSchema } from './index.js';

describe('functionDefinitionSchema Parser', () => {
	it('should validate a correct function definition', () => {
		const input = {
			type: 'function',
			function: {
				name: 'get_delivery_date',
				description: "Get the delivery date for a customer's order...",
				parameters: {
					type: 'object',
					properties: {
						order_id: {
							type: 'string',
							description: "The customer's order ID.",
						},
					},
					required: ['order_id'],
					additionalProperties: false,
				},
			},
		};

		expect(() => functionDefinitionSchema.parse(input)).not.toThrow();
	});

	it("should fail if type is not 'function'", () => {
		const input = {
			type: 'object',
			function: {
				name: 'not_a_function',
				description: 'Not a function',
				parameters: { type: 'object', properties: {} },
			},
		};

		expect(() => functionDefinitionSchema.parse(input)).toThrow();
	});

	it('should fail if parameters is not a valid JSON schema', () => {
		const input = {
			type: 'function',
			function: {
				name: 'invalid_params',
				description: 'Parameters is not a valid schema',
				parameters: {
					type: 'object',
					properties: {
						invalidType: {
							type: 'strng', // invalid type spelling
						},
					},
				},
			},
		};

		expect(() => functionDefinitionSchema.parse(input)).toThrow();
	});
});
