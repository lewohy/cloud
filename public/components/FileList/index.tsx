import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import axios from 'axios';
import { useDialogContainer as useSmulogContainer } from '~/public/dialogs/dialog';
import promptDialog from '~/public/dialogs/PromptDialog';
import path from 'path';
import random from 'random';
import { createEffect, createSignal, For } from 'solid-js';
import { FileListItem } from './FileListItem';
import { FunctionBar } from './FunctionBar';
import { UpItem } from './UpItem';
import cr from '~/public/ts/cr';

export interface FileListProps {
    scope: string;
    path: string[];
    onUpClick?: () => void;
    onItemClick?: (item: cloud.Item) => void;
}

function createRandomNullArray(): Array<cloud.Item | null> {
    return Array.from({
        length: random.int(5, 10)
    }, () => null);
}

export const FileList = (props: FileListProps) => {
    const [itemList, setItemList] = createSignal<cloud.Item[] | null>(null);
    const [uploadQueue, setUploadQueue] = createSignal<FileSystemFileEntry[]>([]);
    const smulogContainer = useSmulogContainer();

    const refreshList = async () => {
        setItemList(null);
        try {
            const response = await cr.get(`/api/storage/${[props.scope, ...props.path].join('/')}`);

            if (response.items !== undefined) {
                setItemList(response.items);
            }
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };

    const createFolder = async (name: string) => {
        try {
            const result = await cr.post(`/api/storage/${[props.scope, ...props.path].join('/')}`, {
                entity: {
                    type: 'directory',
                    name
                }
            });
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
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

            <FunctionBar
                onUploadClick={() => {
                    // TODO: 파일 업로드
                }}
                onCreateFolderClick={async () => {
                    // TODO: 폴더 생성
                    const result = await promptDialog.show(smulogContainer, {
                        title: 'Create Folder'
                    }, {
                        message: '폴더 이름을 입력하세요.',
                        label: 'New Folder'
                    });

                    if (result.response === 'positive') {
                        if (result.returns !== undefined) {
                            createFolder(result.returns.value);
                        }
                    }
                }}
                onCreateFileClick={() => {
                    // TOOD: 파일 생성
                }} />

            {
                itemList() === null &&
                <For
                    each={createRandomNullArray()}>
                    {(item: cloud.Item | null) => (
                        <FileListItem
                            item={item}
                            onClick={e => {
                                if (item !== null) {
                                    props.onItemClick?.(item);
                                }
                            }} />
                    )}
                </For>
            }
            {
                itemList() !== null &&
                <>
                    {
                        props.path.length > 0 &&
                        <UpItem
                            onClick={e => {
                                props.onUpClick?.();
                            }} />
                    }
                    <For
                        each={itemList()}>
                        {(item: cloud.Item | null) => (
                            <FileListItem
                                item={item}
                                onClick={e => {
                                    if (item !== null) {
                                        props.onItemClick?.(item);
                                    }
                                }} />
                        )}
                    </For>
                </>
            }

        </Stack>
    );
};
