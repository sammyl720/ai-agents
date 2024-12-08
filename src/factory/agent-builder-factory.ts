import { AgentBuilder } from '@builders';
import type { AI } from '@definitions';

export class AgentBuilderFactory {
	constructor(private openai: AI) {}

	getBuilder() {
		return new AgentBuilder().addOpenAIClient(this.openai);
	}
}
