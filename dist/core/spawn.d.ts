import { foreignServiceError } from './canvas-client.js';
export { foreignServiceError };
export declare function canvasPort(): number;
export declare function isCanvasHealth(health: {
    service?: string;
} | null): boolean;
export interface EnsureResult {
    url: string;
    spawned: boolean;
}
/**
 * Make sure OUR canvas server is answering at EXPRESS_SERVER_URL,
 * auto-spawning a detached one on a loopback URL when needed. A healthy
 * responder without the service identity marker is a foreign service —
 * proceeding against it would only produce confusing downstream errors.
 *
 * `force: true` (the explicit `start` command) overrides the auto-start
 * opt-outs — an explicit start is user intent, not auto-start.
 *
 * A concurrent-spawn race is safe: the canvas server's loopback guard makes
 * the losing process exit, and every caller here only proceeds once /health
 * answers.
 */
export declare function ensureCanvasRunning(options?: {
    timeoutMs?: number;
    force?: boolean;
}): Promise<EnsureResult>;
export interface StopResult {
    stopped: boolean;
    pid?: number;
    message: string;
}
/**
 * Stop the canvas server. Identity-safe: we only ever signal the pid that a
 * live /health responder reports about ITSELF, and only when it identifies
 * as this canvas service. A stale pidfile is cleaned up, never killed —
 * recycled pids and unrelated apps squatting on the port are safe.
 */
export declare function stopCanvas(): Promise<StopResult>;
//# sourceMappingURL=spawn.d.ts.map