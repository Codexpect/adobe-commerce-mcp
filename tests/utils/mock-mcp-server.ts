import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface MockToolCall {
  name: string;
  args: unknown;
  result?: unknown;
  error?: Error;
}

export interface MockMcpServer {
  server: McpServer;
  registeredTools: Map<string, any>;
  toolCalls: MockToolCall[];
  registerTool: (name: string, definition: any, handler: any) => void;
  callTool: (name: string, args: unknown) => Promise<unknown>;
  clearHistory: () => void;
}

/**
 * Creates a mock MCP server for testing tool registration and execution
 */
export function createMockMcpServer(): MockMcpServer {
  const registeredTools = new Map<string, any>();
  const toolCalls: MockToolCall[] = [];

  const mockServer = {
    registerTool: jest.fn((name: string, definition: any, handler: any) => {
      registeredTools.set(name, { definition, handler });
    }),
    // Add other server methods as needed
  } as unknown as McpServer;

  const mockMcpServer: MockMcpServer = {
    server: mockServer,
    registeredTools,
    toolCalls,
    
    registerTool: (name: string, definition: any, handler: any) => {
      registeredTools.set(name, { definition, handler });
      mockServer.registerTool(name, definition, handler);
    },
    
    callTool: async (name: string, args: unknown): Promise<unknown> => {
      const tool = registeredTools.get(name);
      if (!tool) {
        const error = new Error(`Tool '${name}' not found`);
        toolCalls.push({ name, args, error });
        throw error;
      }
      
      try {
        const result = await tool.handler(args);
        toolCalls.push({ name, args, result });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        toolCalls.push({ name, args, error: err });
        throw err;
      }
    },
    
    clearHistory: () => {
      toolCalls.length = 0;
    }
  };

  return mockMcpServer;
}

/**
 * Helper function to extract tool response text from MCP tool result
 */
export function extractToolResponseText(result: unknown): string {
  if (typeof result === 'object' && result !== null && 'content' in result) {
    const content = (result as { content: unknown }).content;
    if (Array.isArray(content) && content.length > 0) {
      const firstItem = content[0];
      if (typeof firstItem === 'object' && firstItem !== null && 'text' in firstItem) {
        return (firstItem as { text: unknown }).text as string;
      }
    }
  }
  return String(result);
}

/**
 * Parses the structured response from Adobe Commerce tools
 */
export function parseToolResponse(responseText: string): {
  meta: Record<string, string>;
  data: string[];
} {
  const metaMatch = responseText.match(/<meta>(.*?)<\/meta>/s);
  const dataMatch = responseText.match(/<data>(.*?)<\/data>/s);
  
  const meta: Record<string, string> = {};
  const data: string[] = [];
  
  if (metaMatch) {
    const metaContent = metaMatch[1].trim();
    const metaLines = metaContent.split('\n').filter(line => line.trim());
    for (const line of metaLines) {
      const tagMatch = line.match(/<(\w+)>(.*?)<\/\1>/);
      if (tagMatch) {
        meta[tagMatch[1]] = tagMatch[2];
      }
    }
  }
  
  if (dataMatch) {
    const dataContent = dataMatch[1].trim();
    data.push(...dataContent.split('\n').filter(line => line.trim()));
  }
  
  return { meta, data };
} 