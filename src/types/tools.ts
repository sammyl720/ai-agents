import type { MessageToolCall, ToolDefinition } from './openai.js';
import type { ToolRequestHandler } from './types.js';

export interface IToolGroup {
	[Symbol.iterator](): Iterator<ITool>;
}

/**
 * Represents a tool that can process a specific type of tool call.
 */
export interface ITool {
	/**
	 * The name of the tool. Generally corresponds to the `function.name` in its definition.
	 */
	readonly toolName: string;

	/**
	 * The definition of this tool, including its type and function details.
	 */
	readonly definition: ToolDefinition;

	/**
	 * Determines whether this tool can handle the provided tool call.
	 * @param request - The tool call to check.
	 * @returns `true` if the tool can handle the request, `false` otherwise.
	 */
	canHandleRequest(request: MessageToolCall): boolean;

	/**
	 * Handles the given tool request and returns a completion response.
	 * @param request - The tool call to handle.
	 * @returns A promise that resolves to a `MessageToolCompletion`.
	 */
	handleRequest: ToolRequestHandler;

	/**
	 * Indicates whether this tool can be used by all agents.
	 * If `true`, all agents have access to this tool. If `false`, it may be restricted.
	 */
	readonly IsGlobal: boolean;

	/**
	 * Checks if this tool is included in a list of tools.
	 * @param tools - The list of tools to check against.
	 * @returns `true` if this tool is present in the provided tools array, `false` otherwise.
	 */
	isIncluded(tools: Iterable<ITool>): boolean;
}
