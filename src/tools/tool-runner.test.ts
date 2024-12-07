import { describe, it, expect, vi } from 'vitest';
import { ToolRunner } from './tool-runner.js';
import { Tool } from './tool.js'; // Adjust import path as needed
import type {
	ITool,
	CompletionMessage,
	MessageToolCall,
	AssistantCompletionMessage,
} from '@definitions';

describe('ToolRunner', () => {
	it('returns empty array when running with no tool calls', async () => {
		const tools: ITool[] = [];
		const runner = new ToolRunner(tools);

		const result = await runner.run([]);
		expect(result).toEqual([]);
	});

	it('returns a result from a tool that can handle the call', async () => {
		const handleRequestMock = vi.fn().mockResolvedValue({
			tool_call_id: 'call_1',
			role: 'tool',
			content: 'Handled by mock tool',
		});

		const mockTool = new Tool(
			{
				type: 'function',
				function: {
					name: 'mockTool',
					description: 'Mock tool',
				},
			},
			handleRequestMock,
		);

		const runner = new ToolRunner([mockTool]);
		const toolCall: MessageToolCall = {
			type: 'function',
			id: 'call_1',
			function: {
				name: 'mockTool',
				arguments: '{}',
			},
		};

		const result = await runner.run([toolCall]);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			tool_call_id: 'call_1',
			role: 'tool',
			content: 'Handled by mock tool',
		});
		expect(handleRequestMock).toHaveBeenCalledWith(toolCall);
	});

	it('returns a fallback message when no tool can handle the call', async () => {
		const handleRequestMock = vi.fn().mockResolvedValue({
			tool_call_id: 'call_1',
			role: 'tool',
			content: 'Should not be used',
		});

		const mockTool = new Tool(
			{
				type: 'function',
				function: {
					name: 'someOtherTool',
					description: 'Another tool',
				},
			},
			handleRequestMock,
		);

		const runner = new ToolRunner([mockTool]);
		const toolCall: MessageToolCall = {
			type: 'function',
			id: 'call_2',
			function: {
				name: 'noTool',
				arguments: '{}',
			},
		};

		const result = await runner.run([toolCall]);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			tool_call_id: 'call_2',
			role: 'tool',
			content: 'No match for function tool call (noTool)',
		});
		// handleRequest should not be called since the tool can't handle 'noTool'
		expect(handleRequestMock).not.toHaveBeenCalled();
	});

	it('runMessageToolCalls returns empty array if message has no tool calls', async () => {
		const handleRequestMock = vi.fn().mockResolvedValue({
			tool_call_id: 'not_used',
			role: 'tool',
			content: 'Should not be called',
		});

		const mockTool = new Tool(
			{
				type: 'function',
				function: {
					name: 'mockTool',
					description: 'Mock tool',
				},
			},
			handleRequestMock,
		);

		const runner = new ToolRunner([mockTool]);
		const message: CompletionMessage = {
			role: 'user',
			content: 'Hello',
		};

		const result = await runner.runMessageToolCalls(message);
		expect(result).toEqual([]);
	});

	it('runMessageToolCalls returns correct results if message has tool calls', async () => {
		const handleRequestMock = vi.fn().mockResolvedValue({
			tool_call_id: 'call_3',
			role: 'tool',
			content: 'Handled from message calls',
		});

		const mockTool = new Tool(
			{
				type: 'function',
				function: {
					name: 'mockTool',
					description: 'Mock tool',
				},
			},
			handleRequestMock,
		);

		const runner = new ToolRunner([mockTool]);
		const message: AssistantCompletionMessage = {
			role: 'assistant',
			content: 'I will call a tool now',
			tool_calls: [
				{
					type: 'function',
					id: 'call_3',
					function: {
						name: 'mockTool',
						arguments: '{}',
					},
				},
			],
		};

		const result = await runner.runMessageToolCalls(message);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			tool_call_id: 'call_3',
			role: 'tool',
			content: 'Handled from message calls',
		});
		expect(handleRequestMock).toHaveBeenCalledWith({
			type: 'function',
			id: 'call_3',
			function: {
				name: 'mockTool',
				arguments: '{}',
			},
		});
	});

	it('hasToolCalls correctly identifies messages with tool calls', () => {
		const runner = new ToolRunner([]);
		const assistantMessage: AssistantCompletionMessage = {
			role: 'assistant',
			content: 'I will call a tool',
			tool_calls: [
				{
					type: 'function',
					id: 'call_4',
					function: {
						name: 'someTool',
						arguments: '{}',
					},
				},
			],
		};
		const userMessage: CompletionMessage = {
			role: 'user',
			content: 'User message',
		};

		expect(runner.hasToolCalls(assistantMessage)).toBe(true);
		expect(runner.hasToolCalls(userMessage)).toBe(false);
	});

	it('handles multiple tool calls in order', async () => {
		// Tool 1 will respond immediately
		const handleRequestMock1 = vi.fn().mockResolvedValue({
			tool_call_id: 'call_1',
			role: 'tool',
			content: 'Handled by mock tool 1',
		});

		const mockTool1 = new Tool(
			{
				type: 'function',
				function: {
					name: 'mockTool1',
					description: 'Mock tool 1',
				},
			},
			handleRequestMock1,
		);

		// Tool 2 will respond after a delay to test if order is preserved
		const handleRequestMock2 = vi
			.fn()
			.mockImplementation(async (call: MessageToolCall) => {
				await new Promise((resolve) => setTimeout(resolve, 50));
				return {
					tool_call_id: call.id,
					role: 'tool',
					content: 'Handled by mock tool 2 (delayed)',
				};
			});

		const mockTool2 = new Tool(
			{
				type: 'function',
				function: {
					name: 'mockTool2',
					description: 'Mock tool 2',
				},
			},
			handleRequestMock2,
		);

		const runner = new ToolRunner([mockTool1, mockTool2]);

		const message: AssistantCompletionMessage = {
			role: 'assistant',
			content: 'I will call multiple tools now',
			tool_calls: [
				{
					type: 'function',
					id: 'call_1',
					function: {
						name: 'mockTool1',
						arguments: '{}',
					},
				},
				{
					type: 'function',
					id: 'call_2',
					function: {
						name: 'mockTool2',
						arguments: '{}',
					},
				},
			],
		};

		const result = await runner.runMessageToolCalls(message);
		expect(result).toHaveLength(2);

		// First call result
		expect(result[0]).toEqual({
			tool_call_id: 'call_1',
			role: 'tool',
			content: 'Handled by mock tool 1',
		});

		// Second call result
		expect(result[1]).toEqual({
			tool_call_id: 'call_2',
			role: 'tool',
			content: 'Handled by mock tool 2 (delayed)',
		});

		expect(handleRequestMock1).toHaveBeenCalledWith({
			type: 'function',
			id: 'call_1',
			function: { name: 'mockTool1', arguments: '{}' },
		});

		expect(handleRequestMock2).toHaveBeenCalledWith({
			type: 'function',
			id: 'call_2',
			function: { name: 'mockTool2', arguments: '{}' },
		});
	});
});
