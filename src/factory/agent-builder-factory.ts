import { AgentBuilder } from '@builders';
import type { AI, IAgent, IBuilderFactory } from '@definitions';

export class AgentBuilderFactory implements IBuilderFactory<IAgent> {
	constructor(private openai: AI) {}

	getBuilder() {
		return new AgentBuilder().addOpenAIClient(this.openai);
	}
}
