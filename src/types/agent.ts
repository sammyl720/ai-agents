import EventEmitter from 'events';
import type { IOrchestrator, ITool } from '@definitions';
import type { TypeOf } from 'zod';
import type { ProjectUpdateParser } from '@parsers';

export type AgentInitConfig = {
	/** Name of agent. Name must be alphanumeric and between 5 and 25  characters long. */
	name: string;
	/** Details about what the agent purpose is and what it can do. Must be between 20 and 500 characters long. */
	description: string;
	/** Openai model to use. */
	model?: string;
};

export interface IAgent extends EventEmitter, ITool {
	initialize(orchestrator: IOrchestrator): void;
	getGlobalTools(): ITool[];
	addGlobalTool(tool: ITool): void;
	notify(update: TypeOf<typeof ProjectUpdateParser>): void;
	readonly AgentDetails: string;
	readonly IsGlobal: false;
}
