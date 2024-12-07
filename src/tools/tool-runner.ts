import type {
	AssistantCompletionMessage,
	CompletionMessage,
	ITool,
	MessageToolCall,
	MessageToolCompletion,
} from '@definitions';

export class ToolRunner {
	constructor(private tools: ITool[]) {}

	/**
	 * Executes an array of tool calls using the available tools.
	 * Each tool call is attempted against all tools until one can handle it.
	 * Unhandled tool calls return a fallback message.
	 *
	 * @param tool_calls - An array of tool calls to be processed.
	 * @returns A promise that resolves to an array of results in the same order as the input calls.
	 */
	public async run(
		tool_calls: MessageToolCall[],
	): Promise<MessageToolCompletion[]> {
		const results = await Promise.allSettled(
			tool_calls.map((tool_call) => this.handleToolCall(tool_call)),
		);

		return results
			.filter(
				(r): r is PromiseFulfilledResult<MessageToolCompletion> =>
					r.status === 'fulfilled',
			)
			.map((r) => r.value);
	}

	/**
	 * Given a completion message, runs all tool calls associated with it (if any),
	 * returning the results in the same order as the calls appear.
	 *
	 * @param message - The completion message that may contain tool calls.
	 * @returns A promise that resolves to an array of tool completion results.
	 *          If no tool calls are present, an empty array is resolved.
	 */
	public async runMessageToolCalls(
		message: CompletionMessage,
	): Promise<MessageToolCompletion[]> {
		if (this.hasToolCalls(message)) {
			const toolCalls = this.getToolCalls(message);
			return this.run(toolCalls);
		}
		return [];
	}

	/**
	 * Checks if a given message is an assistant message with associated tool calls.
	 *
	 * @param message - The completion message to check.
	 * @returns True if the message is an AssistantCompletionMessage and has tool calls.
	 */
	public hasToolCalls(
		message: CompletionMessage,
	): message is AssistantCompletionMessage {
		return this.getToolCalls(message).length > 0;
	}

	private async handleToolCall(
		tool_call: MessageToolCall,
	): Promise<MessageToolCompletion> {
		const tool = this.tools.find((t) => t.canHandleRequest(tool_call));
		if (tool) {
			return tool.handleRequest(tool_call);
		}

		return {
			tool_call_id: tool_call.id,
			role: 'tool',
			content: `No match for function tool call (${tool_call.function.name})`,
		};
	}

	private getToolCalls(message: CompletionMessage): MessageToolCall[] {
		if (this.isAssistantMessage(message)) {
			return message.tool_calls ?? [];
		}

		return [];
	}

	private isAssistantMessage(
		message: CompletionMessage,
	): message is AssistantCompletionMessage {
		return message.role === 'assistant' && !!message.tool_calls?.length;
	}
}
