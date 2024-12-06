import EventEmitter from 'events';
import type {
	MessageToolCall,
	MessageToolCompletion,
	ToolDefinition,
} from './openai.js';
import type { IAgent } from '@definitions';
import type { IMessageRunner } from '@message-runner';

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

export interface IOrchestrator extends EventEmitter {
	readonly Instructions: string;
	readonly strategy: IOrchestrationStrategy;
	getAgentsDetails(): string;
	run(instructions: string): Promise<number>;
	setCompletionResult<T>(result: T | string): void;
	getMessageRunner(): IMessageRunner;
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
	additionalContext?: string;
};

export function isTaskSnapshot(obj: any): obj is TaskSnapshot {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'description' in obj &&
		typeof obj.description === 'string'
	);
}

export interface IOrchestrationStrategy {
	getSystemPrompt(orchestrator: IOrchestrator): string;
	getAgentPrompt(orchestrator: IOrchestrator, agent: IAgent): string;
	getOnCompleteTool(orchestrator: IOrchestrator): ITool;
}
