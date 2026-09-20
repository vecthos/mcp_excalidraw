import { McpServer } from '@modelcontextprotocol/server';
import type { McpRequestContext, McpServerFactory } from '@modelcontextprotocol/server';
/**
 * Builds a fresh MCP server instance exposing the Excalidraw toolkit.
 *
 * One instance serves exactly one serving unit (one stdio connection, or one
 * discarded `server/discover` probe), which is why nothing canvas-related is
 * stored on it — see `core/canvas-state.ts`. The same factory backs both
 * protocol eras, so the advertised tools and their behaviour are identical
 * whether the client opened with `initialize` (2025) or with the per-request
 * `_meta` envelope (2026-07-28).
 */
export declare function createExcalidrawMcpServer(ctx?: McpRequestContext): McpServer;
/**
 * The factory handed to the SDK's serving entries (`serveStdio`). It is called
 * once per connection with the era the connection negotiated.
 */
export declare const excalidrawMcpServerFactory: McpServerFactory;
//# sourceMappingURL=mcp-server.d.ts.map