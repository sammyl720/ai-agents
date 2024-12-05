import type OpenAI from 'openai';
import EventEmitter from 'events';

export type ToolDefinition = OpenAI.Chat.Completions.ChatCompletionTool;
export type MessageToolCall =
	OpenAI.Chat.Completions.ChatCompletionMessageToolCall;
export type MessageToolCompletion =
	OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
export type CreateChatParams =
	OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

export interface ITool {
	readonly definition: ToolDefinition;
	canHandleRequest(request: MessageToolCall): boolean;
	handleRequest(
		request: MessageToolCall,
	): Promise<MessageToolCompletion> | MessageToolCompletion;
}

export interface IAgent extends ITool {
	initialize(orchestrator: IOrchestrator): void;
	readonly AgentDetails: string;
}

export interface IOrchestrator extends EventEmitter {
	readonly Instructions: string;
	getAgentsDetails(): string;
}

export interface IToolBox {
	addTool(tool: ITool): boolean;
	getTools(): ITool[];
	canDelegateRequest(
		request: MessageToolCall,
	): ReturnType<ITool['canHandleRequest']>;
	deleteRequest(request: MessageToolCall): ReturnType<ITool['handleRequest']>;
}

export type TaskSnapshot = {
	description: string;
	id: string;
	additionalContext?: string;
};

export function isTaskSnapshot(obj: any): obj is TaskSnapshot {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'description' in obj &&
		typeof obj.description === 'string' &&
		'id' in obj &&
		typeof obj.id === 'string'
	);
}
