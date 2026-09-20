export interface ExportedScene {
    scene: Record<string, any>;
    elementCount: number;
}
export declare function buildSceneFile(): Promise<ExportedScene>;
export interface ImportResult {
    count: number;
    fileCount: number;
    mode: 'replace' | 'merge';
}
export declare function importScene(options: {
    filePath?: string;
    data?: string;
    mode: 'replace' | 'merge';
}): Promise<ImportResult>;
//# sourceMappingURL=scene-io.d.ts.map