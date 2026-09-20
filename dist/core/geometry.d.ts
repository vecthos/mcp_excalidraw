import { ServerElement } from '../types.js';
export type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type Direction = 'horizontal' | 'vertical';
export declare function alignElements(elementIds: string[], alignment: Alignment): Promise<{
    aligned: boolean;
    elementIds: string[];
    alignment: Alignment;
    successCount: number;
}>;
export declare function distributeElements(elementIds: string[], direction: Direction): Promise<{
    distributed: boolean;
    elementIds: string[];
    direction: Direction;
    count: number;
}>;
export declare function setElementsLocked(elementIds: string[], locked: boolean): Promise<{
    elementIds: string[];
    successCount: number;
}>;
export declare function groupElements(elementIds: string[]): Promise<{
    groupId: string;
    elementIds: string[];
    successCount: number;
}>;
export declare function ungroupElements(groupId: string, knownMemberIds?: string[]): Promise<{
    groupId: string;
    ungrouped: boolean;
    elementIds: string[];
    successCount: number;
}>;
export declare function duplicateElements(elementIds: string[], offsetX?: number, offsetY?: number): Promise<{
    duplicates: ServerElement[];
    canvasElements: ServerElement[] | null;
    offsetX: number;
    offsetY: number;
}>;
//# sourceMappingURL=geometry.d.ts.map