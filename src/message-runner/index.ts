import type {
	AI,
	CompletionMessage,
	CreateChatParams,
	IMessageHandler,
	IMessageRunner,
	ITool,
} from '@definitions';
import { ToolRunner } from '../tools/index.js';
import { DEFAULT_OPENAI_MODEL } from '../consts.js';

export class MessageRunner implements IMessageRunner {
	constructor(
		private openai: AI,
		private model: string = DEFAULT_OPENAI_MODEL,
	) {}

	async run(
		messageHandler: IMessageHandler,
		tools: ITool[],
	): Promise<CompletionMessage | null> {
		while (true) {
			const chatRequest = this.createChatRequest(messageHandler, tools);
			const response = await this.openai.chat.completions.create(chatRequest);
			const newMessage = response.choices[0]?.message ?? null;

			if (!newMessage) {
				return null;
			}

			messageHandler.addMessage(newMessage);

			const toolRunner = new ToolRunner(tools);
			if (toolRunner.hasToolCalls(newMessage)) {
				const toolCompletions =
					await toolRunner.runMessageToolCalls(newMessage);
				messageHandler.addMessages(toolCompletions);
				// Loop again since we may have more tool calls after tool completions
			} else {
				// No tool calls, we can exit the loop
				return newMessage;
			}
		}
	}

	private createChatRequest(
		messageHandler: IMessageHandler,
		tools: ITool[],
	): CreateChatParams {
		const createParams: CreateChatParams = {
			messages: messageHandler.getMessages(),
			model: this.model,
		};

		if (tools.length) {
			createParams.tools = this.getUniqueToolDefinitions(tools);
		}

		return createParams;
	}

	private getUniqueToolDefinitions(tools: ITool[]) {
		return tools
			.reduce((list, current) => {
				if (!list.some((tool) => tool.toolName === current.toolName)) {
					list.push(current);
				}
				return list;
			}, [] as ITool[])
			.map((tool) => tool.definition);
	}
}
