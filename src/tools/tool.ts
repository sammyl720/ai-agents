import type { ITool, MessageToolCall } from '../types.js';

export class Tool implements ITool {
	constructor(
		public readonly definition: ITool['definition'],
		public handleRequest: ITool['handleRequest'],
	) {}

	public canHandleRequest(request: MessageToolCall) {
		return this.definition.function.name === request.function.name;
	}
}
