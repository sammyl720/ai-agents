import { describe, it, expect, vi } from 'vitest';
import { ToolRunner } from './tool-runner.js';
import type {
  ITool,
  CompletionMessage,
  MessageToolCall,
  MessageToolCompletion,
  AssistantCompletionMessage
} from '@definitions';

// Mock tool objects
function createMockTool(
  options: Partial<ITool> & {
    canHandle?: boolean;
    handleResult?: MessageToolCompletion;
  } = {}
): ITool {
  const {
    toolName = 'mockTool',
    definition = {  
        type: 'function',
        function: {
            name: 'mockTool', description: 'Mock tool'
        }
    },
    canHandle = true,
    handleResult = {
      tool_call_id: 'default_call_id',
      role: 'tool',
      content: 'Default result from mock tool'
    },
    IsGlobal = false
  } = options;

  return {
    toolName,
    definition,
    IsGlobal,
    canHandleRequest: vi.fn().mockImplementation(() => canHandle),
    handleRequest: vi.fn().mockResolvedValue(handleResult),
    isIncluded: vi.fn().mockReturnValue(true),
  };
}

describe('ToolRunner', () => {
  it('returns empty array when running with no tool calls', async () => {
    const tools: ITool[] = [];
    const runner = new ToolRunner(tools);

    const result = await runner.run([]);
    expect(result).toEqual([]);
  });

  it('returns a result from a tool that can handle the call', async () => {
    const mockTool = createMockTool({
      canHandle: true,
      handleResult: {
        tool_call_id: 'call_1',
        role: 'tool',
        content: 'Handled by mock tool'
      }
    });

    const runner = new ToolRunner([mockTool]);
    const toolCall: MessageToolCall = {
        type: 'function',
        function: {
            name: 'mockTool',
            arguments: '{}'
        },
        id: 'call_1'
    };

    const result = await runner.run([toolCall]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      tool_call_id: 'call_1',
      role: 'tool',
      content: 'Handled by mock tool'
    });
    expect(mockTool.canHandleRequest).toHaveBeenCalledWith(toolCall);
    expect(mockTool.handleRequest).toHaveBeenCalledWith(toolCall);
  });

  it('returns a fallback message when no tool can handle the call', async () => {
    const mockTool = createMockTool({
      canHandle: false
    });

    const runner = new ToolRunner([mockTool]);
    const toolCall: MessageToolCall = {
      type: 'function',
      id: 'call_2',
      function: {
        arguments: '{}',
        name: "noTool",

      }
    };

    const result = await runner.run([toolCall]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      tool_call_id: 'call_2',
      role: 'tool',
      content: 'No match for function tool call (noTool)'
    });
    expect(mockTool.canHandleRequest).toHaveBeenCalledWith(toolCall);
    // handleRequest should not be called since canHandleRequest returned false
    expect(mockTool.handleRequest).not.toHaveBeenCalled();
  });

  it('runMessageToolCalls returns empty array if message has no tool calls', () => {
    const mockTool = createMockTool({ canHandle: true });
    const runner = new ToolRunner([mockTool]);
    const message: CompletionMessage = {
      role: 'user',
      content: 'Hello'
    };

    const result = runner.runMessageToolCalls(message);
    expect(result).toEqual([]);
  });

  it('runMessageToolCalls returns correct results if message has tool calls', async () => {
    const mockTool = createMockTool({
      canHandle: true,
      handleResult: {
        tool_call_id: 'call_3',
        role: 'tool',
        content: 'Handled from message calls'
      }
    });

    const runner = new ToolRunner([mockTool]);
    const message: AssistantCompletionMessage = {
      role: 'assistant',
      content: 'I will call a tool now',
      tool_calls: [
        {
          type: 'function',  
          id: 'call_3',
          function: { 
            name: 'mockTool',
            arguments: '{}'
          }
        },
      ],
    };

    const result = await runner.runMessageToolCalls(message);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      tool_call_id: 'call_3',
      role: 'tool',
      content: 'Handled from message calls'
    });
  });

  it('hasToolCalls correctly identifies messages with tool calls', () => {
    const runner = new ToolRunner([]);
    const assistantMessage: AssistantCompletionMessage = {
      role: 'assistant',
      content: 'I will call a tool',
      tool_calls: [{
        type: 'function',
        id: 'call_4',
        function: { 
            name: 'someTool',
            arguments: '{}'
        }
      }]
    };
    const userMessage: CompletionMessage = {
      role: 'user',
      content: 'User message'
    };

    expect(runner.hasToolCalls(assistantMessage)).toBe(true);
    expect(runner.hasToolCalls(userMessage)).toBe(false);
  });
});
