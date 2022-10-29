import Stack from '@suid/material/Stack';
import path from 'path';
import { createSignal, For } from 'solid-js';
import { FileListItem } from '../FileListItem';

export interface FileListProps {
    scope: string;
    path: string[];
}

export const FileList = (props: FileListProps) => {
    const [itemList, setItemList] = createSignal<cloud.Item[]>([]);
    const [uploadQueue, setUploadQueue] = createSignal<FileSystemFileEntry[]>([]);

    const addToPending = (entry: FileSystemEntry) => {
        if (entry.isDirectory) {
            const directoryEntry = entry as FileSystemDirectoryEntry;

            directoryEntry.createReader().readEntries((entries) => {
                (entry as FileSystemDirectoryEntry).createReader().readEntries((entries) => {
                    entries.forEach(addToPending);
                });
            });

        } else if (entry.isFile) {
            const fileEntry = entry as FileSystemFileEntry;
            // TODO: 중복 처리
            setUploadQueue([...uploadQueue(), fileEntry]);
        }
    };

    const init = () => {
        document.body.addEventListener('drop', async e => {
            e.preventDefault();

            const items = e.dataTransfer?.items;
            
            if (items !== undefined) {
                for (let i = 0; i < items.length ?? 0; i++) {
                    const item = items[i];
                    const file = item.getAsFile();
                    const entry = item.webkitGetAsEntry();
                    console.log(item)
                    console.log(file)
                    console.log(entry)
                    if (entry !== null) {
                        addToPending(entry);
                    }
                }
            }
        });

        document.body.addEventListener('dragover', e => {
            e.preventDefault();
        });

        document.body.addEventListener('dragenter', e => {
            e.preventDefault();
        });

        document.body.addEventListener('dragleave', e => {
            e.preventDefault();
        });
    };

    init();

    return (
        <Stack
            sx={{
                height: '100%',
            }}>
            <FileListItem
                entity={{
                    name: 'test',
                    location: {
                        scope: props.scope,
                        path: props.path
                    },
                    createdTime: new Date().getTime(),
                    size: 0,
                    state: 'normal'
                }} />

            <For
                each={itemList()}>
                {(item: cloud.Item) => (
                    <FileListItem
                        item={item} />
                )}
            </For>

        </Stack>
    );
};
