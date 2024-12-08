import EventEmitter from 'events';
import type {
	IMessageRunner,
	MessageToolCall,
	MessageToolCompletion,
	ToolDefinition,
} from './openai.js';
import type { IAgent, ITool } from '@definitions';
import { z } from 'zod';
import type { ProjectCompletionParser, ProjectUpdateParser } from '@parsers';

export type ToolRequestHandler = (
	request: MessageToolCall,
) => Promise<MessageToolCompletion> | MessageToolCompletion;

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

export type CompletionResult = z.infer<typeof ProjectCompletionParser>;
