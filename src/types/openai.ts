import OpenAI from 'openai';

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
