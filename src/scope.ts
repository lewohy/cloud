import { getMeta } from './meta';

export function getScopeList(): string[] {
    const meta = getMeta({
        scope: '',
        path: [],
    });

    return meta.items.filter(item => item.type === 'directory').map(item => item.name);
};