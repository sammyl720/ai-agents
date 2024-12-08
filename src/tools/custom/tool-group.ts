import type {
	FunctionDefinition,
	ITool,
	IToolGroup,
	ToolRequestHandler,
} from '../../types/index.js';
import { Tool } from '../tool.js';
import { createToolDefinition } from '../util.js';

export class ToolGroup implements IToolGroup {
	tools: ITool[] = [];

	[Symbol.iterator](): Iterator<ITool> {
		let index = 0;
		const items = this.tools;

		return {
			next(): IteratorResult<ITool> {
				const item = items[index++];
				if (item) {
					return { value: item, done: false };
				} else {
					return { value: undefined, done: true };
				}
			},
		};
	}

	addTool(
		definition: FunctionDefinition,
		handler: ToolRequestHandler,
		isGlobal = false,
	) {
		const tool = new Tool(createToolDefinition(definition), handler, isGlobal);
		if (tool.isIncluded(this)) {
			return;
		}
		this.tools.push(tool);
	}
}
