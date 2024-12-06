import type { MessageHandler } from '@message-handler';
import type {
	AI,
	CompletionMessage,
	CreateChatParams,
	ITool,
} from '@definitions';
import { ToolRunner } from '@tools';
import { DEFAULT_OPENAI_MODEL } from 'src/consts.js';

export interface IMessageRunner {
	run(
		messageHandler: MessageHandler,
		tools: ITool[],
	): Promise<CompletionMessage | null>;
}

export class MessageRunner implements IMessageRunner {
	constructor(
		private openai: AI,
		private model: string = DEFAULT_OPENAI_MODEL,
	) {}

	async run(
		messageHandler: MessageHandler,
		tools: ITool[],
	): Promise<CompletionMessage | null> {
		const chatRequest = this.createChatRequest(messageHandler, tools);

		const response = await this.openai.chat.completions.create(chatRequest);

		const newMessage = response.choices[0]?.message;
		if (newMessage) {
			messageHandler.addMessage(newMessage);
			const toolRunner = new ToolRunner(tools);
			if (toolRunner.hasToolCalls(newMessage)) {
				const toolCompletions =
					await toolRunner.runMessageToolCalls(newMessage);
				messageHandler.addMessages(toolCompletions);
				return this.run(messageHandler, tools);
			}
		}
		return newMessage ?? null;
	}

	private createChatRequest(
		messageHandler: MessageHandler,
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
		return [
			...new Map(
				tools.map((tool) => [tool.toolName, tool.definition]),
			).values(),
		];
	}
}
