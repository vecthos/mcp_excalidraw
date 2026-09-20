#!/usr/bin/env node
import type { StdioServerHandle } from '@modelcontextprotocol/server/stdio';
declare function runServer(): Promise<StdioServerHandle>;
export { createExcalidrawMcpServer, excalidrawMcpServerFactory } from './core/mcp-server.js';
export { runServer };
export default runServer;
//# sourceMappingURL=index.d.ts.map