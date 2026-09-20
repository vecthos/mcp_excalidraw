export declare class CliUsageError extends Error {
    readonly exitCode = 2;
}
export interface FlagSpec {
    takesValue: boolean;
    repeatable?: boolean;
}
export interface ParsedArgs {
    positionals: string[];
    flags: Record<string, string | boolean | string[]>;
}
export declare function parseArgs(argv: string[], spec: Record<string, FlagSpec>): ParsedArgs;
export declare function readStdin(): Promise<string>;
//# sourceMappingURL=args.d.ts.map