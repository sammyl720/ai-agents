import EventEmitter from 'events';
import type {
	IMessageRunner,
	MessageToolCall,
	MessageToolCompletion,
	ToolDefinition,
} from './openai.js';
import type { IAgent } from '@definitions';
import { z } from 'zod';
import type { ProjectCompletionParser, ProjectUpdateParser } from '@parsers';

export type ToolRequestHandler = (
	request: MessageToolCall,
) => Promise<MessageToolCompletion> | MessageToolCompletion;

/**
 * Represents a tool that can process a specific type of tool call.
 */
export interface ITool {
	/**
	 * The name of the tool. Generally corresponds to the `function.name` in its definition.
	 */
	readonly toolName: string;

	/**
	 * The definition of this tool, including its type and function details.
	 */
	readonly definition: ToolDefinition;

	/**
	 * Determines whether this tool can handle the provided tool call.
	 * @param request - The tool call to check.
	 * @returns `true` if the tool can handle the request, `false` otherwise.
	 */
	canHandleRequest(request: MessageToolCall): boolean;

	/**
	 * Handles the given tool request and returns a completion response.
	 * @param request - The tool call to handle.
	 * @returns A promise that resolves to a `MessageToolCompletion`.
	 */
	handleRequest: ToolRequestHandler;

	/**
	 * Indicates whether this tool can be used by all agents.
	 * If `true`, all agents have access to this tool. If `false`, it may be restricted.
	 */
	readonly IsGlobal: boolean;

	/**
	 * Checks if this tool is included in a list of tools.
	 * @param tools - The list of tools to check against.
	 * @returns `true` if this tool is present in the provided tools array, `false` otherwise.
	 */
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

export type CompletionResult = z.infer<typeof ProjectCompletionParser>;
