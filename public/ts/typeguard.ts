export function isDirectory(entry: FileSystemEntry): entry is FileSystemDirectoryEntry {
    return entry.isDirectory;
}

export function isFile(entry: FileSystemEntry): entry is FileSystemFileEntry {
    return entry.isFile;
}