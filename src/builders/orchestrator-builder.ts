import type OpenAI from 'openai';
import type { IAgent, IBuilder, IOrchestrator } from '../types.js';
import { Orchestrator } from '../orchestrator/orchestrator.js';

export class OrchestratorBuilder implements IBuilder<IOrchestrator> {
	private openAI: OpenAI | null = null;
	private agents: IAgent[] = [];

	build() {
		if (this.openAI === null) {
			throw new Error(
				`Please pass in your OPENAI client first to the  AgentBuilder.addOpenAIClient(client) method.`,
			);
		} else if (this.agents.length === 0) {
			throw new Error(
				`Please add atleast one agent before building orchestrator.`,
			);
		}

		return new Orchestrator(this.openAI, this.agents);
	}

	isBuildable() {
		return this.openAI !== null && this.agents.length > 0;
	}

	addOpenAIClient(openAI: OpenAI) {
		this.openAI = openAI;
		return this;
	}

	addAgent(agent: IAgent) {
		this.agents.push(agent);
		return this;
	}

	addAgents(agents: Iterable<IAgent>) {
		for (const agent of agents) {
			this.addAgent(agent);
		}

		return this;
	}
}