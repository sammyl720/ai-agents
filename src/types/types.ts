import EventEmitter from 'events';
import type {
	MessageToolCall,
	MessageToolCompletion,
	ToolDefinition,
} from './openai.js';
import type { IAgent } from '@definitions';
import type { IMessageRunner } from '@message-runner';
import { z } from 'zod';
import type { ProjectCompletionParser, ProjectUpdateParser } from '@parsers';

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
	setCompletionResult(result: z.infer<typeof ProjectCompletionParser>): void;
	notifyAllAgents(update: z.infer<typeof ProjectUpdateParser>): void;
	getMessageRunner(): IMessageRunner;
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
	getOrchestratorTools(orchestrator: IOrchestrator): Iterable<ITool>;
}
