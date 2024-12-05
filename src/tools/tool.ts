import type { ITool, MessageToolCall } from '../types.js';

export class Tool implements ITool {
	constructor(
		public readonly definition: ITool['definition'],
		public handleRequest: ITool['handleRequest'],
		public readonly IsGlobal = false,
	) {}

	public canHandleRequest(request: MessageToolCall) {
		return this.definition.function.name === request.function.name;
	}

	get toolName() {
		return this.definition.function.name;
	}

	isIncluded(tools: ITool[]): boolean {
		return tools.some((t) => t.toolName === this.toolName);
	}
}
