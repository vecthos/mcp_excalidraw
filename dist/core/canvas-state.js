import { ensureCanvasRunning } from './spawn.js';
export const sceneState = {
    theme: 'light',
    viewport: { x: 0, y: 0, zoom: 1 },
    selectedElements: new Set(),
    groups: new Map()
};
let canvasEnsurePromise = null;
export async function ensureCanvasReadyForMcpTool() {
    if (!canvasEnsurePromise) {
        canvasEnsurePromise = ensureCanvasRunning().finally(() => {
            canvasEnsurePromise = null;
        });
    }
    await canvasEnsurePromise;
}
export function toolNeedsCanvasBeforeDispatch(name) {
    return name !== 'read_diagram_guide' && name !== 'get_resource';
}
//# sourceMappingURL=canvas-state.js.map