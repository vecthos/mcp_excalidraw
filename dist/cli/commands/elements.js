import { parseArgs, CliUsageError } from '../args.js';
import { printJson, readJsonInput } from '../util.js';
import { prepareElement, prepareElementUpdate } from '../../core/normalize.js';
import { batchCreateElementsStrict, updateElementStrict, deleteElementStrict, getElementStrict, getElements, searchElements } from '../../core/canvas-client.js';
import { ensureCanvasRunning } from '../../core/spawn.js';
// apply: primary mutation command — {create:[], update:[], delete:[]} in one
// invocation; a bare JSON array is shorthand for {create: [...]}.
function normalizePatchUpdate(update) {
    if (!update || typeof update !== 'object' || Array.isArray(update)) {
        throw new CliUsageError('Every update entry must be an object with an "id"');
    }
    if (!update.id)
        throw new CliUsageError('Every update entry needs an "id"');
    const { id, set, ...rest } = update;
    if (set === undefined) {
        return { id, updates: rest };
    }
    if (!set || typeof set !== 'object' || Array.isArray(set)) {
        throw new CliUsageError('Update entry "set" must be an object');
    }
    if (Object.keys(rest).length > 0) {
        throw new CliUsageError('Use either direct update fields or "set", not both');
    }
    return { id, updates: set };
}
export async function apply(argv) {
    const { positionals } = parseArgs(argv, {});
    const input = await readJsonInput(positionals[0], 'patch');
    const patch = Array.isArray(input) ? { create: input } : input;
    if (!patch.create?.length && !patch.update?.length && !patch.delete?.length) {
        throw new CliUsageError('Patch has no create/update/delete operations');
    }
    await ensureCanvasRunning();
    let created = [];
    if (patch.create?.length) {
        created = await batchCreateElementsStrict(patch.create.map(el => prepareElement(el)));
    }
    const updated = [];
    if (patch.update?.length) {
        const typeById = new Map((await getElements()).map(element => [element.id, element.type]));
        for (const update of patch.update) {
            const { id, updates } = normalizePatchUpdate(update);
            const existingType = typeById.get(id);
            if (!existingType)
                throw new Error(`Element ${id} not found`);
            const element = await updateElementStrict(prepareElementUpdate(id, updates, existingType));
            typeById.set(id, element.type);
            updated.push(element);
        }
    }
    const deleted = [];
    for (const id of patch.delete || []) {
        await deleteElementStrict(id);
        deleted.push(id);
    }
    printJson({
        success: true,
        created: created.length,
        updated: updated.length,
        deleted: deleted.length,
        elements: created
    });
}
// add: batch create (alias for apply with a bare array); --one '<json>' for a
// single element without wrapping it in [].
export async function add(argv) {
    const { positionals, flags } = parseArgs(argv, { one: { takesValue: true } });
    let elements;
    if (typeof flags.one === 'string') {
        try {
            elements = [JSON.parse(flags.one)];
        }
        catch (error) {
            throw new CliUsageError(`Invalid JSON in --one: ${error.message}`);
        }
    }
    else {
        const input = await readJsonInput(positionals[0], 'elements');
        elements = Array.isArray(input) ? input : [input];
    }
    await ensureCanvasRunning();
    const created = await batchCreateElementsStrict(elements.map(el => prepareElement(el)));
    printJson({ success: true, count: created.length, elements: created });
}
export async function update(argv) {
    const { positionals, flags } = parseArgs(argv, { set: { takesValue: true } });
    const id = positionals[0];
    if (!id)
        throw new CliUsageError('Usage: update <id> --set \'{"backgroundColor": "#ffc9c9"}\'');
    let updates;
    if (typeof flags.set === 'string') {
        try {
            updates = JSON.parse(flags.set);
        }
        catch (error) {
            throw new CliUsageError(`Invalid JSON in --set: ${error.message}`);
        }
    }
    else {
        updates = await readJsonInput(positionals[1], 'updates');
    }
    await ensureCanvasRunning();
    // Fetch the real type so text→label conversion skips text elements
    const existing = await getElementStrict(id);
    const element = await updateElementStrict(prepareElementUpdate(id, updates, existing.type));
    printJson({ success: true, element });
}
export async function del(argv) {
    const { positionals } = parseArgs(argv, {});
    if (positionals.length === 0)
        throw new CliUsageError('Usage: delete <id> [<id> ...]');
    await ensureCanvasRunning();
    for (const id of positionals) {
        await deleteElementStrict(id);
    }
    printJson({ success: true, deleted: positionals, count: positionals.length });
}
export async function get(argv) {
    const { positionals } = parseArgs(argv, {});
    const id = positionals[0];
    if (!id)
        throw new CliUsageError('Usage: get <id>');
    await ensureCanvasRunning();
    printJson(await getElementStrict(id));
}
// Coerce "true"/"false"/numeric strings so --filter locked=true works against
// real element values (the server search endpoint only compares raw strings).
function coerce(value) {
    if (value === 'true')
        return true;
    if (value === 'false')
        return false;
    if (value === 'null')
        return null;
    if (value.trim() !== '' && !Number.isNaN(Number(value)))
        return Number(value);
    return value;
}
function lookupPath(obj, dotPath) {
    return dotPath.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}
export async function query(argv) {
    const { flags } = parseArgs(argv, {
        type: { takesValue: true },
        bbox: { takesValue: true },
        filter: { takesValue: true, repeatable: true },
        'filter-json': { takesValue: true }
    });
    await ensureCanvasRunning();
    // type + bbox filter server-side via the search endpoint
    const queryParams = new URLSearchParams();
    if (typeof flags.type === 'string')
        queryParams.set('type', flags.type);
    if (typeof flags.bbox === 'string') {
        const parts = flags.bbox.split(',').map(s => Number(s.trim()));
        if (parts.length !== 4 || parts.some(Number.isNaN)) {
            throw new CliUsageError('--bbox expects "x_min,y_min,x_max,y_max"');
        }
        const [xMin, yMin, xMax, yMax] = parts;
        queryParams.set('x_min', String(xMin));
        queryParams.set('y_min', String(yMin));
        queryParams.set('x_max', String(xMax));
        queryParams.set('y_max', String(yMax));
    }
    let results = queryParams.size > 0
        ? await searchElements(queryParams)
        : await getElements();
    // key=value / nested / typed predicates filter client-side. Each k=v pair
    // matches on the coerced value (`locked=true` → boolean) OR the raw string
    // (`id=123` must still find id: "123").
    const predicates = [];
    for (const pair of flags.filter || []) {
        const eq = pair.indexOf('=');
        if (eq === -1)
            throw new CliUsageError(`--filter expects key=value, got "${pair}"`);
        const key = pair.slice(0, eq);
        const raw = pair.slice(eq + 1);
        const coerced = coerce(raw);
        predicates.push(el => {
            const actual = lookupPath(el, key);
            if (Array.isArray(actual)) {
                return actual.includes(raw) || actual.includes(coerced);
            }
            return actual === coerced || actual === raw;
        });
    }
    if (typeof flags['filter-json'] === 'string') {
        let obj;
        try {
            obj = JSON.parse(flags['filter-json']);
        }
        catch (error) {
            throw new CliUsageError(`Invalid JSON in --filter-json: ${error.message}`);
        }
        for (const [key, expected] of Object.entries(obj)) {
            predicates.push(el => {
                const actual = lookupPath(el, key);
                if (Array.isArray(actual))
                    return actual.includes(expected);
                return actual === expected;
            });
        }
    }
    if (predicates.length > 0) {
        results = results.filter(el => predicates.every(matches => matches(el)));
    }
    printJson(results);
}
//# sourceMappingURL=elements.js.map