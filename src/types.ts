import type OpenAI from 'openai';
import EventEmitter from 'events';

export type ToolDefinition = OpenAI.Chat.Completions.ChatCompletionTool;
export type MessageToolCall =
	OpenAI.Chat.Completions.ChatCompletionMessageToolCall;
export type MessageToolCompletion =
	OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
export type CreateChatParams =
	OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

export interface IBuilder<T> {
	build: () => T;
	isBuildable: () => boolean;
}

export type ToolRequestHandler = (
	request: MessageToolCall,
) => Promise<MessageToolCompletion> | MessageToolCompletion;

export interface ITool {
	readonly toolName: string;
	readonly definition: ToolDefinition;
	canHandleRequest(request: MessageToolCall): boolean;
	handleRequest: ToolRequestHandler;
	/** Tool can be used by all agents when set to true. */
	readonly IsGlobal: boolean;
	isIncluded(tools: ITool[]): boolean;
}

export interface IAgent extends ITool {
	initialize(orchestrator: IOrchestrator): void;
	getGlobalTools(): ITool[];
	addGlobalTool(tool: ITool): void;
	readonly AgentDetails: string;
	readonly IsGlobal: false;
}

export interface IOrchestrator extends EventEmitter {
	readonly Instructions: string;
	readonly strategy: IOrchestrationStrategy;
	getAgentsDetails(): string;
	run(instructions: string): Promise<number>;
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

export interface IOrchestrationStrategy {
	getSystemPrompt(orchestrator: IOrchestrator): string;
	getAgentPrompt(orchestrator: IOrchestrator, agent: IAgent): string;
}
