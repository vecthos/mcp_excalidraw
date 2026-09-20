import logger from '../utils/logger.js';
import { EXPRESS_SERVER_URL, ENABLE_CANVAS_SYNC } from './config.js';
// Helper functions to sync with Express server (canvas)
export async function syncToCanvas(operation, data) {
    if (!ENABLE_CANVAS_SYNC) {
        logger.debug('Canvas sync disabled, skipping');
        return null;
    }
    try {
        let url;
        let options;
        switch (operation) {
            case 'create':
                url = `${EXPRESS_SERVER_URL}/api/elements`;
                options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                };
                break;
            case 'update':
                url = `${EXPRESS_SERVER_URL}/api/elements/${data.id}`;
                options = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                };
                break;
            case 'delete':
                url = `${EXPRESS_SERVER_URL}/api/elements/${data.id}`;
                options = { method: 'DELETE' };
                break;
            case 'batch_create':
                url = `${EXPRESS_SERVER_URL}/api/elements/batch`;
                options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ elements: data })
                };
                break;
            default:
                logger.warn(`Unknown sync operation: ${operation}`);
                return null;
        }
        await assertCanvasIdentity();
        logger.debug(`Syncing to canvas: ${operation}`, { url, data });
        const response = await fetch(url, options);
        // Parse JSON response regardless of HTTP status
        const result = await response.json();
        if (!response.ok) {
            logger.warn(`Canvas sync returned error status: ${response.status}`, result);
            throw new Error(result.error || `Canvas sync failed: ${response.status} ${response.statusText}`);
        }
        logger.debug(`Canvas sync successful: ${operation}`, result);
        return result;
    }
    catch (error) {
        logger.warn(`Canvas sync failed for ${operation}:`, error.message);
        // Don't throw - we want MCP operations to work even if canvas is unavailable
        return null;
    }
}
// Helper to sync element creation to canvas.
// Sync disabled = deliberate no-op (echo the input, legacy behavior);
// sync enabled but failed = null, so callers report the failure instead of
// claiming "synced to canvas" for an element that never landed.
export async function createElementOnCanvas(elementData) {
    if (!ENABLE_CANVAS_SYNC)
        return elementData;
    const result = await syncToCanvas('create', elementData);
    return result?.element ?? null;
}
// Helper to sync element update to canvas
export async function updateElementOnCanvas(elementData) {
    const result = await syncToCanvas('update', elementData);
    return result?.element || null;
}
// Helper to sync element deletion to canvas
export async function deleteElementOnCanvas(elementId) {
    const result = await syncToCanvas('delete', { id: elementId });
    return result;
}
// Helper to sync batch creation to canvas (same failure semantics as
// createElementOnCanvas: disabled = echo, failed = null)
export async function batchCreateElementsOnCanvas(elementsData) {
    if (!ENABLE_CANVAS_SYNC)
        return elementsData;
    const result = await syncToCanvas('batch_create', elementsData);
    return result?.elements ?? null;
}
// Helper to fetch element from canvas
export async function getElementFromCanvas(elementId) {
    if (!ENABLE_CANVAS_SYNC) {
        logger.debug('Canvas sync disabled, skipping fetch');
        return null;
    }
    try {
        await assertCanvasIdentity();
        const response = await fetch(`${EXPRESS_SERVER_URL}/api/elements/${elementId}`);
        if (!response.ok) {
            logger.warn(`Failed to fetch element ${elementId}: ${response.status}`);
            return null;
        }
        const data = await response.json();
        return data.element || null;
    }
    catch (error) {
        logger.error('Error fetching element from canvas:', error);
        return null;
    }
}
// ---- Typed REST wrappers shared by the MCP server and CLI ----
async function requestJson(path, init) {
    await assertCanvasIdentity();
    const response = await fetch(`${EXPRESS_SERVER_URL}${path}`, init);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.error || `HTTP server error: ${response.status} ${response.statusText}`);
    }
    return data;
}
export async function getElements() {
    const data = await requestJson('/api/elements');
    return data.elements || [];
}
export async function searchElements(queryParams) {
    const data = await requestJson(`/api/elements/search?${queryParams}`);
    return data.elements || [];
}
export async function clearCanvas() {
    return requestJson('/api/elements/clear', { method: 'DELETE' });
}
export async function getFiles() {
    const data = await requestJson('/api/files');
    return data.files || {};
}
export async function postFiles(files) {
    await requestJson('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(files)
    });
}
export async function exportImage(format, background = true) {
    return requestJson('/api/export/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, background })
    });
}
export async function setViewport(params) {
    return requestJson('/api/viewport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
}
export async function saveSnapshot(name) {
    return requestJson('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
}
export async function listSnapshots() {
    return requestJson('/api/snapshots');
}
export async function getSnapshot(name) {
    const data = await requestJson(`/api/snapshots/${encodeURIComponent(name)}`);
    return data.snapshot;
}
export async function sendMermaid(mermaidDiagram, config) {
    return requestJson('/api/elements/from-mermaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mermaidDiagram, config })
    });
}
// ---- Strict CRUD variants (throw on failure) ----
// syncToCanvas deliberately swallows errors so MCP tools degrade gracefully;
// the CLI wants hard failures with real error messages instead.
export async function createElementStrict(element) {
    const data = await requestJson('/api/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(element)
    });
    return data.element;
}
export async function updateElementStrict(element) {
    const data = await requestJson(`/api/elements/${element.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(element)
    });
    return data.element;
}
export async function deleteElementStrict(id) {
    return requestJson(`/api/elements/${id}`, { method: 'DELETE' });
}
export async function getElementStrict(id) {
    const data = await requestJson(`/api/elements/${id}`);
    if (!data.element) {
        throw new Error(`Element ${id} not found`);
    }
    return data.element;
}
export async function batchCreateElementsStrict(elements) {
    const data = await requestJson('/api/elements/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements })
    });
    return data.elements || [];
}
// Identity marker the canvas server puts in /health (v1.1+)
export const CANVAS_SERVICE_NAME = 'mcp-excalidraw-canvas';
export function foreignServiceError() {
    const error = new Error(`Something is answering at ${EXPRESS_SERVER_URL} but does not identify as this canvas server ` +
        `(a pre-1.1 canvas build or an unrelated service on the port). ` +
        `Upgrade/stop that service, or point EXPRESS_SERVER_URL elsewhere.`);
    error.code = 'CANVAS_UNREACHABLE';
    return error;
}
// Revalidating identity gate in front of every /api request: mutations must
// not reach a foreign service squatting on the canvas port. The verification
// is cached only briefly (burst-coalescing TTL) so a long-lived MCP server
// re-checks identity after its verified canvas goes away — a service swapped
// onto the port is refused within seconds, while batch operations (align =
// many concurrent requests) share a single probe instead of stampeding
// /health. Note this is defense-in-depth against accidents, not a security
// boundary: local processes can always reach a loopback port directly.
const IDENTITY_TTL_MS = 3000;
let identityVerifiedAt = 0;
let identityProbe = null;
export function markCanvasIdentityVerified() {
    identityVerifiedAt = Date.now();
}
async function assertCanvasIdentity() {
    if (Date.now() - identityVerifiedAt < IDENTITY_TTL_MS)
        return;
    if (!identityProbe) {
        identityProbe = (async () => {
            try {
                let response;
                try {
                    response = await fetch(`${EXPRESS_SERVER_URL}/health`, { signal: AbortSignal.timeout(1500) });
                }
                catch (error) {
                    // Fail CLOSED on timeout: a listener that accepts connections but
                    // never answers /health could still be a foreign service that
                    // would accept /api mutations.
                    const name = error?.name;
                    if (name === 'TimeoutError' || name === 'AbortError') {
                        const timeoutError = new Error(`The service at ${EXPRESS_SERVER_URL} did not answer the /health identity probe within 1500ms — ` +
                            `refusing to send it requests.`);
                        timeoutError.code = 'CANVAS_UNREACHABLE';
                        throw timeoutError;
                    }
                    // Connection-level unreachable (refused/reset/DNS): canvas is down
                    // or booting — let the actual request fail with its own error.
                    // Deliberately not marked verified, so the next call re-probes.
                    return;
                }
                // SOMETHING answered. Only a 200 with our identity payload may pass —
                // a 404 or an HTML page here is a foreign service, not a down canvas.
                let health = null;
                try {
                    health = await response.json();
                }
                catch { /* non-JSON body: foreign */ }
                if (!response.ok || health?.service !== CANVAS_SERVICE_NAME) {
                    throw foreignServiceError();
                }
                identityVerifiedAt = Date.now();
            }
            finally {
                identityProbe = null;
            }
        })();
    }
    return identityProbe;
}
export async function getHealth(timeoutMs = 2000) {
    const response = await fetch(`${EXPRESS_SERVER_URL}/health`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
}
export async function getSyncStatus() {
    return requestJson('/api/sync/status');
}
//# sourceMappingURL=canvas-client.js.map