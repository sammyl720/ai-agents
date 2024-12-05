import type OpenAI from 'openai';
import type { IAgent, IOrchestrator, ITool } from '../types.js';
import { MessageHandler } from '../message-handler/message-handler.js';
import { MessageRunner } from '../message-runner/message-runner.js';
import { DEFAULT_OPENAI_MODEL } from '../consts.js';
import EventEmitter from 'events';

export class Orchestrator extends EventEmitter implements IOrchestrator {
	private instructions = '';
	private messageHandler = new MessageHandler();
	private globalTools: ITool[] = [];

	constructor(
		private openai: OpenAI,
		private agents: IAgent[],
		private tools: ITool[] = [],
	) {
		super();
		this.globalTools = tools.filter((tool) => tool.IsGlobal);
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
			content: this.orchestratorSystemPrompt,
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

	private get orchestratorSystemPrompt(): string {
		return `## You are a project lead of a team of agents tasked to complete the following goal:
        ${this.instructions}
        
        #### Your responsibility as the project lead is as follows:
        1. Create tasks aimed at achieving the aforementioned goal.
        2. Delegate (i.e hand of tasks) to agents on the team .
        3. Keep creating and delegating tasks until the goal is achieved or when, in the rear case, deemed unacheivable.

        You be assigned tasks that are suited for you given your designation.

        ### Agent's on your team
        ${this.getAgentsDetails()}
        
        You've be suppled with tools to hand of tasks to agent's on your team.`;
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
