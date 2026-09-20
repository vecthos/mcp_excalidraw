import { parseArgs } from '../args.js';
import { printJson, note } from '../util.js';
import { ensureCanvasRunning, stopCanvas, canvasPort, isCanvasHealth, foreignServiceError } from '../../core/spawn.js';
import { getHealth, getSyncStatus } from '../../core/canvas-client.js';
import { EXPRESS_SERVER_URL } from '../../core/config.js';
import { readPidFile } from '../../core/pidfile.js';
export async function start(argv) {
    parseArgs(argv, {});
    // Explicit start is user intent — it overrides the auto-start opt-outs
    const result = await ensureCanvasRunning({ force: true });
    if (!result.spawned) {
        note(`Canvas server already running at ${result.url}`);
    }
    printJson({
        running: true,
        url: result.url,
        spawned: result.spawned,
        pid: readPidFile(canvasPort()) ?? undefined
    });
}
export async function stop(argv) {
    parseArgs(argv, {});
    const result = await stopCanvas();
    printJson(result);
}
export async function status(argv) {
    parseArgs(argv, {});
    let health;
    try {
        health = await getHealth();
    }
    catch {
        printJson({ running: false, url: EXPRESS_SERVER_URL });
        const error = new Error(`Canvas server is not running at ${EXPRESS_SERVER_URL}`);
        error.code = 'CANVAS_UNREACHABLE';
        error.quiet = true; // JSON above already tells the story
        throw error;
    }
    if (!isCanvasHealth(health)) {
        printJson({
            running: false,
            url: EXPRESS_SERVER_URL,
            conflict: 'another service (or a pre-1.1 canvas build) is answering at this URL'
        });
        const error = foreignServiceError();
        error.quiet = true;
        throw error;
    }
    let sync = {};
    try {
        sync = await getSyncStatus();
    }
    catch { /* health is enough */ }
    printJson({
        running: true,
        url: EXPRESS_SERVER_URL,
        // Prefer the pid the server reports about itself; the pidfile can be stale
        pid: health.pid ?? readPidFile(canvasPort()) ?? undefined,
        elements: health.elements_count,
        browserClients: health.websocket_clients,
        ...sync
    });
}
//# sourceMappingURL=server.js.map