export function isDirectoryEntry(entry: FileSystemEntry): entry is FileSystemDirectoryEntry {
    return entry.isDirectory;
}

export function isFileEntry(entry: FileSystemEntry): entry is FileSystemFileEntry {
    return entry.isFile;
}

export function isFile(entity?: cloud.Entity | null): entity is cloud.File {
    return entity?.type === 'file';
}

export function isDirectory(entity?: cloud.Entity | null): entity is cloud.Directory {
    return entity?.type === 'directory';
}
