export interface SceneState {
    theme: string;
    viewport: {
        x: number;
        y: number;
        zoom: number;
    };
    selectedElements: Set<string>;
    groups: Map<string, string[]>;
}
export declare const sceneState: SceneState;
export declare function ensureCanvasReadyForMcpTool(): Promise<void>;
export declare function toolNeedsCanvasBeforeDispatch(name: string): boolean;
//# sourceMappingURL=canvas-state.d.ts.map