import type OpenAI from 'openai';
import type {
	CompletionMessage,
	CompletionMessageToolCalls,
	MessageHandler,
} from '../message-handler/message-handler.js';
import type {
	CreateChatParams,
	ITool,
	MessageToolCompletion,
} from '../types.js';
import { ToolRunner } from '../tools/tool-runner.js';

export interface IMessageRunner {
	run(
		messageHandler: MessageHandler,
		tools: ITool[],
	): Promise<CompletionMessage | null>;
}

export class MessageRunner implements IMessageRunner {
	constructor(
		private openai: OpenAI,
		private model: string,
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
