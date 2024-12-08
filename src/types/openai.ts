import OpenAI from 'openai';
import type { ITool } from './types.js';

/**
 * OpenAI should satify this interface
 */
export interface AI {
	chat: Chat;
}

export interface Chat {
	completions: Completions;
}

export interface Completions {
	create: (body: CreateChatParams) => Promise<ChatCompletion>;
}

export type ToolDefinition = OpenAI.Chat.Completions.ChatCompletionTool;
export type MessageToolCall =
	OpenAI.Chat.Completions.ChatCompletionMessageToolCall;
export type MessageToolCompletion =
	OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
export type CreateChatParams =
	OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

export type CompletionMessage =
	OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type ChatCompletion = OpenAI.Chat.Completions.ChatCompletion;
export type AssistantCompletionMessage =
	OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;

export interface IMessageHandler {
	addMessage(messsage: CompletionMessage): IMessageHandler;
	addMessages(message: CompletionMessage[]): IMessageHandler;
	getMessages(): CompletionMessage[];
	getLastMessage(): CompletionMessage | undefined;
}

/**
 * IMessageRunner defines an interface for running a conversation step.
 * It interacts with an AI model to generate a new message response
 * and processes any tool calls included in that response.
 */
export interface IMessageRunner {
	/**
	 * Runs one step of a conversation using the provided message handler and tools.
	 * It sends a request to the AI model with the current conversation (obtained from messageHandler),
	 * receives a response, and if the response includes tool calls, executes those tools and
	 * potentially repeats the process until no more tool calls are present.
	 *
	 * @param messageHandler - The message handler that stores and retrieves the conversation messages.
	 * @param tools - The array of tools available to the AI model.
	 * @returns A Promise that resolves to the last generated completion message from the AI,
	 *          or null if no message was returned by the AI.
	 */
	run(
		messageHandler: IMessageHandler,
		tools: ITool[],
	): Promise<CompletionMessage | null>;
}
