import type { CallToolResult } from '@modelcontextprotocol/server';
/**
 * Dispatches one `tools/call` invocation. Era-agnostic on purpose: the same
 * dispatcher backs a 2025-era connection opened with `initialize` and a
 * 2026-07-28 connection that starts with `server/discover` (or with a bare
 * `tools/call`), so tool behaviour can never drift between the two.
 */
export declare function callExcalidrawTool(name: string, args: Record<string, unknown> | undefined): Promise<CallToolResult>;
//# sourceMappingURL=mcp-dispatch.d.ts.map