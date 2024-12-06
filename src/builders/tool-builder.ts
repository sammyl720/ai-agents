import { Tool } from '@tools';
import type {
	IBuilder,
	ITool,
	ToolDefinition,
	ToolRequestHandler,
} from '@definitions';

export class ToolBuilder implements IBuilder<ITool> {
	private definition: ToolDefinition | null = null;
	private toolRequestHandler: ToolRequestHandler | null = null;
	private isGlobalTool = false;

	build() {
		if (!this.isBuildable()) {
			throw new Error('Please set tool definition and handler first.');
		}

		return new Tool(
			this.definition!,
			this.toolRequestHandler!,
			this.isGlobalTool,
		);
	}

	isBuildable() {
		return this.definition !== null && this.toolRequestHandler !== null;
	}

	setToolDefinition(definition: ToolDefinition) {
		this.definition = definition;
		return this;
	}

	setToolRequestHandler(handler: ToolRequestHandler) {
		this.toolRequestHandler = handler;
		return this;
	}

	setIsGlobal(isGlobal: boolean) {
		this.isGlobalTool = isGlobal;
		return this;
	}
}
