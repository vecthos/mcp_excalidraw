import { ServerElement } from '../types.js';
export declare function sanitizeFilePath(filePath: string): string;
export declare function normalizePoints(points: Array<{
    x: number;
    y: number;
} | [number, number]>): [number, number][];
export declare function convertTextToLabel(element: ServerElement): ServerElement;
export interface ElementInput {
    id?: string;
    type: string;
    points?: Array<{
        x: number;
        y: number;
    } | [number, number]>;
    startElementId?: string;
    endElementId?: string;
    fontFamily?: string | number;
    [key: string]: unknown;
}
export declare function prepareElement(elementData: ElementInput): ServerElement;
export declare function prepareElementUpdate(id: string, updates: Record<string, unknown>, knownType?: string): Partial<ServerElement> & {
    id: string;
};
//# sourceMappingURL=normalize.d.ts.map