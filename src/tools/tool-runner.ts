import type {
	AssistantCompletionMessage,
	CompletionMessage,
	ITool,
	MessageToolCall,
	MessageToolCompletion,
} from '@definitions';

export class ToolRunner {
	constructor(private tools: ITool[]) {}

	public async run(
		tool_calls: MessageToolCall[],
	): Promise<MessageToolCompletion[]> {
		const results = await Promise.allSettled(
			tool_calls.map(async (tool_call) => {
				const result = await this.handleToolCall(tool_call);
				return result;
			}),
		);
		return results
			.filter(
				(result): result is PromiseFulfilledResult<MessageToolCompletion> =>
					result.status === 'fulfilled',
			)
			.map((result) => result.value);
	}

	public runMessageToolCalls(message: CompletionMessage) {
		if (this.hasToolCalls(message)) {
			return this.run(this.getToolCalls(message));
		}

		return [];
	}

	private async handleToolCall(
		tool_call: MessageToolCall,
	): Promise<MessageToolCompletion> {
		const tool = this.tools.find((t) => t.canHandleRequest(tool_call));
		if (!!tool) {
			const result = await tool.handleRequest(tool_call);
			return result;
		}

		return {
			tool_call_id: tool_call.id,
			role: 'tool',
			content: `No match for function tool call (${tool_call.function.name})`,
		};
	}

	hasToolCalls(
		message: CompletionMessage,
	): message is AssistantCompletionMessage {
		return !!this.getToolCalls(message).length;
	}

	private getToolCalls(message: CompletionMessage): MessageToolCall[] {
		if (this.isAssistantMesage(message)) {
			return message.tool_calls ?? [];
		}

		return [];
	}

	private isAssistantMesage(
		message: CompletionMessage,
	): message is AssistantCompletionMessage {
		return message.role === 'assistant' && !!message.tool_calls?.length;
	}
}
