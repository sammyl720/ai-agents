import { describe, it, beforeEach, expect, vi } from 'vitest';
import { MessageRunner } from './index.js';
import { ToolRunner } from '../tools/index.js';
import type {
	AI,
	IMessageHandler,
	ITool,
	CompletionMessage,
	AssistantCompletionMessage,
	ChatCompletion,
} from '@definitions';

describe('MessageRunner', () => {
	const mockAIResponse = (messages: CompletionMessage[]): ChatCompletion => ({
		id: 'completion_id',
		object: 'chat.completion',
		created: Date.now(),
		model: 'test-model',
		// @ts-ignore
		choices: messages.map((message) => ({
			index: 0,
			finish_reason: 'stop',
			message,
		})),
		usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
	});

	let openai: AI;
	let messageHandler: IMessageHandler;
	let tools: ITool[];
	let createMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		openai = {
			chat: {
				completions: {
					create: vi.fn(),
				},
			},
		} as unknown as AI; // casting to AI since we're mocking
		messageHandler = {
			addMessage: vi.fn().mockReturnThis(),
			addMessages: vi.fn().mockReturnThis(),
			getMessages: vi.fn().mockReturnValue([]),
			getLastMessage: vi.fn().mockReturnValue(undefined),
		};

		createMock = openai.chat.completions.create as ReturnType<typeof vi.fn>;

		tools = [];
	});

	it('returns null if no message is returned by the AI', async () => {
		(
			openai.chat.completions.create as ReturnType<typeof vi.fn>
		).mockResolvedValue(
			mockAIResponse([]), // No messages in the response
		);

		const runner = new MessageRunner(openai, 'test-model');
		const result = await runner.run(messageHandler, tools);
		expect(result).toBeNull();
		expect(messageHandler.addMessage).not.toHaveBeenCalled();
	});

	it('returns the new message if AI returns a message with no tool calls', async () => {
		const aiMessage: CompletionMessage = {
			role: 'assistant',
			content: 'Hello, world!',
		};

		(
			openai.chat.completions.create as ReturnType<typeof vi.fn>
		).mockResolvedValue(mockAIResponse([aiMessage]));

		const runner = new MessageRunner(openai, 'test-model');
		const result = await runner.run(messageHandler, tools);
		expect(result).toEqual(aiMessage);
		expect(messageHandler.addMessage).toHaveBeenCalledWith(aiMessage);
	});

	it('executes tool calls if returned by the AI and continues until no tool calls remain', async () => {
		// Mock AI messages:
		// First response includes a tool call
		const toolCallMessage: AssistantCompletionMessage = {
			role: 'assistant',
			content: 'I will call a tool now',
			tool_calls: [
				{
					type: 'function',
					id: 'call_1',
					function: { name: 'mockTool', arguments: '{}' },
				},
			],
		};

		// After executing the tool call, AI returns a final message with no tool calls
		const finalMessage: CompletionMessage = {
			role: 'assistant',
			content: 'Tool results included. Done now.',
		};

		createMock
			.mockResolvedValueOnce(mockAIResponse([toolCallMessage])) // first run
			.mockResolvedValueOnce(mockAIResponse([finalMessage])); // second run

		// Mock the ToolRunner to return the tool completions
		const runMessageToolCallsSpy = vi
			.spyOn(ToolRunner.prototype, 'runMessageToolCalls')
			.mockResolvedValueOnce([
				{
					tool_call_id: 'call_1',
					role: 'tool',
					content: 'Tool completed',
				},
			]);

		tools = [
			{
				toolName: 'mockTool',
				definition: {
					type: 'function',
					function: { name: 'mockTool', description: 'A mock tool' },
				},
				IsGlobal: false,
				canHandleRequest: () => true,
				handleRequest: vi.fn().mockResolvedValue({
					tool_call_id: 'call_1',
					role: 'tool',
					content: 'Tool completed',
				}),
				isIncluded: (t) => [...t].length > 0,
			},
		];

		const runner = new MessageRunner(openai, 'test-model');
		const result = await runner.run(messageHandler, tools);

		// First message has a tool call
		expect(messageHandler.addMessage).toHaveBeenCalledWith(toolCallMessage);
		expect(runMessageToolCallsSpy).toHaveBeenCalledWith(toolCallMessage);
		expect(messageHandler.addMessages).toHaveBeenCalledWith([
			{
				tool_call_id: 'call_1',
				role: 'tool',
				content: 'Tool completed',
			},
		]);

		// Second message, no tool calls
		expect(result).toEqual(finalMessage);
		expect(messageHandler.addMessage).toHaveBeenCalledWith(finalMessage);
	});

	it('includes tool definitions in the createChatRequest if tools are provided', async () => {
		tools = [
			{
				toolName: 'toolA',
				definition: {
					type: 'function',
					function: { name: 'toolA', description: 'A tool' },
				},
				IsGlobal: true,
				canHandleRequest: vi.fn(),
				handleRequest: vi.fn(),
				isIncluded: vi.fn().mockReturnValue(true),
			},
			{
				toolName: 'toolA', // same name, should be de-duped
				definition: {
					type: 'function',
					function: { name: 'toolA', description: 'A tool duplicate' },
				},
				IsGlobal: true,
				canHandleRequest: vi.fn(),
				handleRequest: vi.fn(),
				isIncluded: vi.fn().mockReturnValue(true),
			},
			{
				toolName: 'toolB',
				definition: {
					type: 'function',
					function: { name: 'toolB', description: 'B tool' },
				},
				IsGlobal: false,
				canHandleRequest: vi.fn(),
				handleRequest: vi.fn(),
				isIncluded: vi.fn().mockReturnValue(true),
			},
		];

		(
			openai.chat.completions.create as ReturnType<typeof vi.fn>
		).mockResolvedValue(mockAIResponse([]));

		const handlerGetMessages = vi
			.fn()
			.mockReturnValue([{ role: 'user', content: 'Hello' }]);
		messageHandler.getMessages = handlerGetMessages;

		const runner = new MessageRunner(openai, 'test-model');
		await runner.run(messageHandler, tools);

		// @ts-ignore
		const callArg = createMock.mock.calls[0][0];
		expect(callArg.tools).toHaveLength(2); // toolA and toolB, but toolA appears once due to deduplication
		expect(callArg.tools).toEqual(
			expect.arrayContaining([
				{
					type: 'function',
					function: { name: 'toolA', description: 'A tool' },
				},
				{
					type: 'function',
					function: { name: 'toolB', description: 'B tool' },
				},
			]),
		);
	});
});
