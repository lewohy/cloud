export function isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value);
}

export function isString(value: any): value is string {
    return typeof value === 'string';
}

export function isFile(entity: cloud.Entity): entity is cloud.File {
    return entity.type === 'file';
}

export function isDirectory(entity: cloud.Entity): entity is cloud.Directory {
    return entity.type === 'directory';
}