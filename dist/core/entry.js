import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
function getErrorCode(error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = error.code;
        return typeof code === 'string' ? code : undefined;
    }
    return undefined;
}
export function resolveEntrypointPath(filePath) {
    if (!filePath)
        return null;
    try {
        return fs.realpathSync(filePath);
    }
    catch (error) {
        const code = getErrorCode(error);
        if (code !== 'ENOENT') {
            logger.warn(`fs.realpathSync failed for "${filePath}", falling back to path.resolve.`, {
                code,
                error: error instanceof Error ? error.message : String(error)
            });
        }
        return path.resolve(filePath);
    }
}
// True when the module at `moduleUrl` is the process entry point.
// npm/npx commonly invoke package bins through symlinks; compare real paths so
// this still holds from those standard install paths (issues #65/#67/#79).
export function isMainModule(moduleUrl) {
    return resolveEntrypointPath(fileURLToPath(moduleUrl)) === resolveEntrypointPath(process.argv[1]);
}
//# sourceMappingURL=entry.js.map