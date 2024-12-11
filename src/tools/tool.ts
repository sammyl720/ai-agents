import type {
	ITool,
	MessageToolCall,
	ToolDefinition,
	ToolRequestHandler,
} from '@definitions';

export class Tool implements ITool {
	constructor(
		public readonly definition: ToolDefinition,
		public handleRequest: ToolRequestHandler,
		public readonly IsGlobal = false,
	) {}

	public canHandleRequest(request: MessageToolCall) {
		return this.definition.function.name === request.function.name;
	}

	get toolName() {
		return this.definition.function.name;
	}

	isIncluded(tools: Iterable<ITool>): boolean {
		for (const t of tools) {
			if (t.toolName === this.toolName) {
				return true;
			}
		}
		return false;
	}
}
