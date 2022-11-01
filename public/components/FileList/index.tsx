import Stack from '@suid/material/Stack';
import axios from 'axios';
import path from 'path';
import { createEffect, createSignal, For } from 'solid-js';
import { FileListItem } from './FileListItem';
import { FunctionBar } from './FunctionBar';

export interface FileListProps {
    scope: string;
    path: string[];
    onUpClick?: () => void;
    onItemClick?: (item: cloud.Item) => void;
}

export const FileList = (props: FileListProps) => {
    const [itemList, setItemList] = createSignal<cloud.Item[]>([]);
    const [uploadQueue, setUploadQueue] = createSignal<FileSystemFileEntry[]>([]);

    const refreshList = async () => {
        const result = await axios.get<cloud.protocol.storage.GetResponse>(`/api/storage/${[props.scope, ...props.path].join('/')}`);
        const response = result.data;

        if (response.result.successed) {
            if (response.items !== undefined) {
                setItemList(response.items);
            }
        }
        // TODO: 요청 실패 처리하기
    };

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

    createEffect(() => {
        refreshList();
    }, []);

    return (
        <Stack
            sx={{
                height: '100%',
            }}>

            <FunctionBar/>
                
            {
                props.path.length > 0 &&
                <FileListItem
                    onClick={e => {
                        props.onUpClick?.();
                    }}/>
            }

            {/* TODO: 로딩 화면 구성하기 */}
            <For
                each={itemList()}>
                {(item: cloud.Item) => (
                    <FileListItem
                        item={item}
                        onClick={e => {
                            props.onItemClick?.(item);
                        }}/>
                )}
            </For>

        </Stack>
    );
};
