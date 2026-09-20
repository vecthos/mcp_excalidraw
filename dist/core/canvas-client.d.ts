import { ServerElement } from '../types.js';
export interface ApiResponse {
    success: boolean;
    element?: ServerElement;
    elements?: ServerElement[];
    message?: string;
    error?: string;
    count?: number;
}
export interface SyncResponse {
    element?: ServerElement;
    elements?: ServerElement[];
}
export declare function syncToCanvas(operation: string, data: any): Promise<SyncResponse | null>;
export declare function createElementOnCanvas(elementData: ServerElement): Promise<ServerElement | null>;
export declare function updateElementOnCanvas(elementData: Partial<ServerElement> & {
    id: string;
}): Promise<ServerElement | null>;
export declare function deleteElementOnCanvas(elementId: string): Promise<any>;
export declare function batchCreateElementsOnCanvas(elementsData: ServerElement[]): Promise<ServerElement[] | null>;
export declare function getElementFromCanvas(elementId: string): Promise<ServerElement | null>;
export declare function getElements(): Promise<ServerElement[]>;
export declare function searchElements(queryParams: URLSearchParams): Promise<ServerElement[]>;
export declare function clearCanvas(): Promise<ApiResponse>;
export declare function getFiles(): Promise<Record<string, any>>;
export declare function postFiles(files: any[]): Promise<void>;
export declare function exportImage(format: 'png' | 'svg', background?: boolean): Promise<{
    success: boolean;
    format: string;
    data: string;
}>;
export declare function setViewport(params: Record<string, unknown>): Promise<{
    success: boolean;
    message?: string;
}>;
export declare function saveSnapshot(name: string): Promise<any>;
export declare function listSnapshots(): Promise<{
    success: boolean;
    snapshots: any[];
    count: number;
}>;
export declare function getSnapshot(name: string): Promise<{
    name: string;
    elements: ServerElement[];
    createdAt: string;
}>;
export declare function sendMermaid(mermaidDiagram: string, config?: Record<string, unknown>): Promise<ApiResponse>;
export declare function createElementStrict(element: ServerElement): Promise<ServerElement>;
export declare function updateElementStrict(element: Partial<ServerElement> & {
    id: string;
}): Promise<ServerElement>;
export declare function deleteElementStrict(id: string): Promise<ApiResponse>;
export declare function getElementStrict(id: string): Promise<ServerElement>;
export declare function batchCreateElementsStrict(elements: ServerElement[]): Promise<ServerElement[]>;
export declare const CANVAS_SERVICE_NAME = "mcp-excalidraw-canvas";
export declare function foreignServiceError(): Error;
export declare function markCanvasIdentityVerified(): void;
export interface HealthStatus {
    status: string;
    timestamp: string;
    elements_count: number;
    websocket_clients: number;
    service?: string;
    pid?: number;
}
export declare function getHealth(timeoutMs?: number): Promise<HealthStatus>;
export declare function getSyncStatus(): Promise<Record<string, unknown>>;
//# sourceMappingURL=canvas-client.d.ts.map