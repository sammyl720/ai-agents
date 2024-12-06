import { OpenAI } from 'openai';
import type {
	IAgent,
	IOrchestrationStrategy,
	IOrchestrator,
	ITool,
} from '@definitions';
import { MessageHandler } from '@message-handler';
import { MessageRunner } from '@message-runner';
import {
	AGENT_UPDATE_EVENT,
	DEFAULT_OPENAI_MODEL,
	ORCHESTRATOR_COMPLETED_EVENT,
	ORCHESTRATOR_UPDATE_EVENT,
} from '../consts.js';
import EventEmitter from 'events';
import { ProjectStrategy } from '../orchestration-strategies/project-strategy.js';

export class Orchestrator extends EventEmitter implements IOrchestrator {
	private instructions = '';
	private messageHandler = new MessageHandler();
	private globalTools: ITool[] = [];
	private isRunning = false;
	private result: any = null;
	private agentUpdateListener = (update: any) =>
		this.emit(AGENT_UPDATE_EVENT, update);

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
			agent.on(AGENT_UPDATE_EVENT, this.agentUpdateListener);
		});

		this.registerGlobalToolsWithAgents();
		this.messageHandler.addMessage({
			role: 'system',
			content: this.strategy.getSystemPrompt(this),
		});

		const runner = new MessageRunner(this.openai, DEFAULT_OPENAI_MODEL);
		const tools = [
			...this.agents,
			...this.globalTools,
			this.strategy.getOnCompleteTool(this),
		];

		this.isRunning = true;
		let currentMesage = await runner.run(this.messageHandler, tools);
		while (this.isRunning && currentMesage != null) {
			this.emit(ORCHESTRATOR_UPDATE_EVENT, currentMesage);
			this.messageHandler.addMessage(currentMesage);
			currentMesage = await runner.run(this.messageHandler, tools);
		}

		this.removeAgentListener();
		this.removeAllListeners();
		this.isRunning = false;

		return 0;
	}

	removeAgentListener() {
		this.agents.forEach((agent) => {
			agent.off(AGENT_UPDATE_EVENT, this.agentUpdateListener);
		});
	}

	setCompletionResult(result: any) {
		this.isRunning = false;
		this.result = result;
		this.emit(ORCHESTRATOR_COMPLETED_EVENT, result);
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
