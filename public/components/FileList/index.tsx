import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import axios from 'axios';
import { useDialogContainer as useSmulogContainer } from '~/public/dialogs/dialog';
import promptDialog from '~/public/dialogs/PromptDialog';
import random from 'random';
import { createEffect, createMemo, createSignal, For } from 'solid-js';
import { FileListItem } from './FileListItem';
import { FunctionBar } from './FunctionBar';
import { UpItem } from './UpItem';
import cr from '~/public/ts/cr';
import { io, Socket } from 'socket.io-client';
import { SxProps } from "@suid/system";
import { Theme } from "@suid/system/createTheme";
import { isDirectory, isFile } from '~/public/ts/typeguard';

export interface FileListProps {
    sx?: SxProps<Theme>;
    location: cloud.Location;
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
    const smulogContainer = useSmulogContainer();
    const socket = createMemo<Socket | null>(prev => {
        prev?.disconnect();

        return io(location.origin, {
            path: '/socket.io',
            query: {
                room: cr.getPathString(props.location)
            }
        })
    }, null);

    const refreshList = async (reload: boolean) => {
        if (reload) {
            setItemList(null);
        }
        try {
            const response = await cr.get(`/api/storage/${cr.getPathString(props.location)}`);

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
            const result = await cr.post(`/api/storage/${cr.getPathString(props.location)}`, {
                entity: {
                    type: 'directory',
                    name,
                    state: 'normal'
                }
            });
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };

    const createFile = async (name: string) => {
        try {
            const result = await cr.post(`/api/storage/${cr.getPathString(props.location)}`, {
                entity: {
                    type: 'file',
                    name,
                    state: 'normal'
                }
            });
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };

    const getFileEntryList = (entry: FileSystemEntry): Promise<FileSystemFileEntry[]> => {
        return new Promise((resolve, reject) => {

            if (isFile(entry)) {
                resolve([entry]);
            } else if (isDirectory(entry)) {
                const reader = entry.createReader();

                reader.readEntries(async (entries) => {
                    const fileEntryList = await Promise.all(entries.map(getFileEntryList));

                    resolve(fileEntryList.flat());
                }, reject);
            }
        });
    };

    const getItemMeta = async (fileEntry: FileSystemFileEntry): Promise<cloud.Item | undefined> => {
        try {
            const meta = await cr.get(`/api/storage/${cr.getPathString(props.location)}${(await getParentEntry(fileEntry)).fullPath}`);

            return meta.items.find(item => item.name === fileEntry.name);
        } catch (error) {
            return undefined;
        }
    };

    const getDuplicateFileList = async (entryList: FileSystemFileEntry[]): Promise<cloud.Item[]> => {
        const duplicated = (await Promise.all(entryList.map(getItemMeta))).filter(item => item !== undefined) as cloud.Item[];

        return duplicated;
    };

    const getParentEntry = (entry: FileSystemEntry): Promise<FileSystemDirectoryEntry> => {
        return new Promise((resolve, reject) => {
            entry.getParent(entry => {
                resolve(entry as FileSystemDirectoryEntry);
            }, reject);
        });
    };

    const init = () => {
        document.body.addEventListener('drop', async e => {
            e.preventDefault();

            const items = e.dataTransfer?.items;

            if (items !== undefined) {
                const entryList = (await Promise.all(Array.from(items).map(item => item.webkitGetAsEntry()))).filter(entry => entry !== null) as FileSystemEntry[];
                const fileEntryList = (await Promise.all(entryList.map(getFileEntryList))).flat();
                const duplicated = await getDuplicateFileList(fileEntryList);

                fileEntryList.forEach(e => {
                    console.log(e.fullPath);
                })

                if (duplicated.length === 0) {
                    fileEntryList.forEach(async fileEntry => {
                        cr.post(`/api/storage/${cr.getPathString(props.location)}${(await getParentEntry(fileEntry)).fullPath}`, {
                            entity: {
                                type: 'file',
                                name: fileEntry.name,
                                state: 'pending'
                            }
                        });

                        cr.upload(`/upload/storage/${cr.getPathString(props.location)}${(await getParentEntry(fileEntry)).fullPath}`, fileEntry);
                    });
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
        refreshList(true);
    });

    createEffect(() => {
        // TODO: refresh일때는 skeleton 안보여주기
        socket()?.on('refresh', () => {
            refreshList(false);
        });
    });

    return (
        <Stack
            sx={props.sx}>

            <FunctionBar
                onUploadClick={() => {
                    // TODO: 파일 업로드
                }}
                onCreateFolderClick={async () => {
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
                onCreateFileClick={async () => {
                    const result = await promptDialog.show(smulogContainer, {
                        title: 'Create File'
                    }, {
                        message: '파일 이름을 입력하세요.',
                        label: 'New File'
                    });

                    if (result.response === 'positive') {
                        if (result.returns !== undefined) {
                            createFile(result.returns.value);
                        }
                    }
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
                        props.location.path.length > 0 &&
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
