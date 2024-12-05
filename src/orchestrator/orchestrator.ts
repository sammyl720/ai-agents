import type OpenAI from 'openai';
import type { IAgent, IOrchestrator } from '../types.js';
import { MessageHandler } from '../message-handler/message-handler.js';
import { MessageRunner } from '../message-runner/message-runner.js';
import { DEFAULT_OPENAI_MODEL } from '../consts.js';
import EventEmitter from 'events';

export class Orchestrator extends EventEmitter implements IOrchestrator {
	private instructions = '';
	private messageHandler = new MessageHandler();

	constructor(
		private openai: OpenAI,
		private agents: IAgent[],
	) {
		super();
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
			agent.initialize(this);
		});
		this.messageHandler.addMessage({
			role: 'system',
			content: this.getOrchestratorSystemPrompt(),
		});

		const runner = new MessageRunner(this.openai, DEFAULT_OPENAI_MODEL);
		let currentMesage = await runner.run(this.messageHandler, this.agents);
		while (currentMesage != null) {
			this.emit('message', currentMesage);
			this.messageHandler.addMessage(currentMesage);
			currentMesage = await runner.run(this.messageHandler, this.agents);
		}

		return 0;
	}

	getOrchestratorSystemPrompt(): string {
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
}
