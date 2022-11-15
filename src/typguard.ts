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

export function isSocketQuery(value: any): value is cloud.protocol.socketio.Query {
    return value !== undefined && isString(value.room);
}

// TODO: 좀더 엄격한 검사 필요
export function isError(value: any): value is Error {
    return value !== undefined && isString(value.message);
}
