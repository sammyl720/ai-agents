import { describe, it, expect, vi } from 'vitest';
import { Tool } from './tool.js'; // Adjust import as needed
import type {
	ITool,
	MessageToolCall,
	MessageToolCompletion,
	ToolDefinition,
} from '@definitions';

describe('Tool', () => {
	const toolDefinition: ToolDefinition = {
		type: 'function',
		function: {
			name: 'exampleTool',
			description: 'An example tool',
		},
	};

	it('toolName matches the definition function name', () => {
		const handleRequest = vi.fn();
		const tool = new Tool(toolDefinition, handleRequest);

		expect(tool.toolName).toBe('exampleTool');
	});

	it('canHandleRequest returns true when function.name matches', () => {
		const handleRequest = vi.fn();
		const tool = new Tool(toolDefinition, handleRequest);

		const request: MessageToolCall = {
			type: 'function',
			id: 'call_1',
			function: {
				name: 'exampleTool',
				arguments: '{}',
			},
		};

		expect(tool.canHandleRequest(request)).toBe(true);
	});

	it('canHandleRequest returns false when function.name does not match', () => {
		const handleRequest = vi.fn();
		const tool = new Tool(toolDefinition, handleRequest);

		const request: MessageToolCall = {
			type: 'function',
			id: 'call_2',
			function: {
				name: 'anotherTool',
				arguments: '{}',
			},
		};

		expect(tool.canHandleRequest(request)).toBe(false);
	});

	it('handleRequest is called with the provided request', async () => {
		const mockResult: MessageToolCompletion = {
			tool_call_id: 'call_3',
			role: 'tool',
			content: 'Handled by exampleTool',
		};

		const handleRequest = vi.fn().mockResolvedValue(mockResult);
		const tool = new Tool(toolDefinition, handleRequest);

		const request: MessageToolCall = {
			type: 'function',
			id: 'call_3',
			function: {
				name: 'exampleTool',
				arguments: '{"input":"data"}',
			},
		};

		const result = await tool.handleRequest(request);
		expect(result).toEqual(mockResult);
		expect(handleRequest).toHaveBeenCalledWith(request);
	});

	it('IsGlobal defaults to false if not provided', () => {
		const handleRequest = vi.fn();
		const tool = new Tool(toolDefinition, handleRequest);
		expect(tool.IsGlobal).toBe(false);
	});

	it('IsGlobal can be set to true', () => {
		const handleRequest = vi.fn();
		const tool = new Tool(toolDefinition, handleRequest, true);
		expect(tool.IsGlobal).toBe(true);
	});

	it('isIncluded returns true if the tool is in the provided list', () => {
		const handleRequest = vi.fn();
		const tool = new Tool(toolDefinition, handleRequest);
		const tools: ITool[] = [tool];

		expect(tool.isIncluded(tools)).toBe(true);
	});

	it('isIncluded returns false if the tool is not in the provided list', () => {
		const handleRequest = vi.fn();
		const tool = new Tool(toolDefinition, handleRequest);
		const otherToolDefinition: ToolDefinition = {
			type: 'function',
			function: {
				name: 'otherTool',
				description: 'Another tool',
			},
		};
		const otherTool = new Tool(otherToolDefinition, vi.fn());

		const tools: ITool[] = [otherTool];
		expect(tool.isIncluded(tools)).toBe(false);
	});
});
