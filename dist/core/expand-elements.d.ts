import { ServerElement } from '../types.js';
export interface ExpandOptions {
    deterministic?: boolean;
}
export declare function canonicalizeKeys(v: any): any;
export declare function expandElementsForExport(sourceElements: ServerElement[], options?: ExpandOptions): Record<string, any>[];
//# sourceMappingURL=expand-elements.d.ts.map