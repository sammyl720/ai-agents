import type { FunctionDefinition, ToolDefinition } from '@definitions';

export function createToolDefinition(
	functionDefinition: FunctionDefinition,
): ToolDefinition {
	return {
		type: 'function',
		function: functionDefinition,
	};
}
