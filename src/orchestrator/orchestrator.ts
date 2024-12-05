import type OpenAI from 'openai';
import type {
	IAgent,
	IOrchestrationStrategy,
	IOrchestrator,
	ITool,
} from '../types.js';
import { MessageHandler } from '../message-handler/message-handler.js';
import { MessageRunner } from '../message-runner/message-runner.js';
import { DEFAULT_OPENAI_MODEL } from '../consts.js';
import EventEmitter from 'events';
import { ProjectStrategy } from '../orchestration-strategies/project-strategy.js';

export class Orchestrator extends EventEmitter implements IOrchestrator {
	private instructions = '';
	private messageHandler = new MessageHandler();
	private globalTools: ITool[] = [];

	constructor(
		private openai: OpenAI,
		private agents: IAgent[],
		private tools: ITool[] = [],
		public readonly strategy: IOrchestrationStrategy = new ProjectStrategy(),
	) {
		super();
		this.globalTools = this.tools.filter((tool) => tool.IsGlobal);
	}

	getAgentsDetails(): string {
		return this.agents.reduce((details, current) => {
			return `${details}${current}`;
		}, '');
	}

	get Instructions() {
		return this.instructions;
	}

	async run(instrucions: string) {
		this.instructions = instrucions;
		this.messageHandler = new MessageHandler();
		this.agents.forEach((agent) => {
			this.addGlobalTools(agent);
			agent.initialize(this);
		});

		this.registerGlobalToolsWithAgents();
		this.messageHandler.addMessage({
			role: 'system',
			content: this.strategy.getSystemPrompt(this),
		});

		const runner = new MessageRunner(this.openai, DEFAULT_OPENAI_MODEL);
		const tools = [...this.agents, ...this.globalTools];

		let currentMesage = await runner.run(this.messageHandler, tools);
		while (currentMesage != null) {
			this.emit('message', currentMesage);
			this.messageHandler.addMessage(currentMesage);
			currentMesage = await runner.run(this.messageHandler, tools);
		}

		return 0;
	}
	private registerGlobalToolsWithAgents() {
		this.agents.forEach((agent) => {
			for (const tool of this.globalTools) {
				agent.addGlobalTool(tool);
			}
		});
	}

	private addGlobalTools(agent: IAgent) {
		const globalTools = agent
			.getGlobalTools()
			.filter((tool) => this.isGlobalToolRegistered(tool));
		this.globalTools = [...this.globalTools, ...globalTools];
	}

	private isGlobalToolRegistered(tool: ITool) {
		const toolName = tool.definition.function.name;
		return this.globalTools.some(
			(t) => t.definition.function.name === toolName,
		);
	}
}
