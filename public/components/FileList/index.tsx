import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { useDialogContainer } from '~/public/dialogs/dialog';
import promptDialog from '~/public/dialogs/PromptDialog';
import random from 'random';
import { createContext, createEffect, createMemo, createSignal, For, JSX, Match, Show, Switch, useContext } from 'solid-js';
import { FileListItem } from './FileListItem';
import { FunctionBar } from './FunctionBar';
import { UpItem } from './UpItem';
import cr from '~/public/ts/cr';
import { io, Socket } from 'socket.io-client';
import { SxProps } from "@suid/system";
import { Theme } from "@suid/system/createTheme";
import { isDirectoryEntry, isFileEntry } from '~/public/ts/typeguard';
import { checkListDialog } from '~/public/dialogs/CheckListDialog';
import alertDialog from '~/public/dialogs/AlertDialog';


interface FileListContext {
    getItem(name: string | null): cloud.Item | undefined;
}

const FileListContext = createContext<FileListContext>();

export interface FileListProps {
    sx?: SxProps<Theme>;
    location: cloud.Location;
    onUpClick?: () => void;
    onItemClick?: (item: cloud.Item) => void;
}

function createRandomNullArray(): null[] {
    return Array.from({
        length: random.int(5, 10)
    }, () => null);
}

export function useFileList(): FileListContext {
    const context = useContext(FileListContext);

    if (context === undefined) {
        throw new Error('Component must be used within a FileList.');
    }

    return context;
}

export const FileList = (props: FileListProps) => {
    const [dropping, setDropping] = createSignal(false);
    const [itemList, setItemList] = createSignal<cloud.Item[] | null>(null);
    const itemNameList = createMemo<string[] | null>((prev) => {
        return itemList()?.map((item) => item.name) ?? null;
    });

    const smulogContainer = useDialogContainer();
    const socket = createMemo<Socket | null>(prev => {
        prev?.disconnect();

        return io(location.origin, {
            path: '/socket.io',
            query: {
                room: cr.getPathString(props.location)
            }
        })
    }, null);

    const context: FileListContext = {
        getItem(name: string) {
            return itemList()?.find(item => item.name === name);
        }
    };

    const refreshList = async (reload: boolean) => {
        if (reload) {
            setItemList(null);
        }
        try {
            const response = await cr.getOptimized(`/api/storage/${cr.getPathString(props.location)}`);

            if (response !== null) {
                if (response.items !== undefined) {
                    setItemList(response.items.sort((a, b) => {
                        if (a.type === 'directory' && b.type === 'file') {
                            return -1;
                        } else if (a.type === 'file' && b.type === 'directory') {
                            return 1;
                        }

                        return a.name.localeCompare(b.name);
                    }));
                }
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

    const renameItem = async (name: string, newName: string) => {
        try {
            const result = await cr.put(`/api/storage/${cr.getPathString(props.location)}/${name}`, {
                name: newName
            });
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };

    const deleteItem = async (name: string) => {
        try {
            const result = await cr.delete(`/api/storage/${cr.getPathString(props.location)}/${name}`);
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };

    const getFileEntryList = (entry: FileSystemEntry): Promise<FileSystemFileEntry[]> => {
        return new Promise((resolve, reject) => {

            if (isFileEntry(entry)) {
                resolve([entry]);
            } else if (isDirectoryEntry(entry)) {
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

    const getDuplicateFileList = async (entryList: FileSystemFileEntry[]): Promise<FileSystemFileEntry[]> => {
        // TODO: Promise all사용으로 시간 단축하기
        const duplicated = (await Promise.all(entryList.map(async entry => {
            const meta = await getItemMeta(entry);

            return meta === undefined ? undefined : entry;
        }))).filter(meta => meta !== undefined) as FileSystemFileEntry[];

        return duplicated;
    };

    const getParentEntry = (entry: FileSystemEntry): Promise<FileSystemDirectoryEntry> => {
        return new Promise((resolve, reject) => {
            entry.getParent(entry => {
                resolve(entry as FileSystemDirectoryEntry);
            }, reject);
        });
    };

    const onDrop = async (e: DragEvent) => {
        e.preventDefault();

        const items = e.dataTransfer?.items;

        if (items !== undefined) {
            const entryList = (await Promise.all(Array.from(items).map(item => item.webkitGetAsEntry()))).filter(entry => entry !== null) as FileSystemEntry[];
            const fileEntryList = (await Promise.all(entryList.map(getFileEntryList))).flat();
            const duplicated = await getDuplicateFileList(fileEntryList);

            if (duplicated.length === 0) {
                fileEntryList.forEach(async fileEntry => {
                    await cr.post(`/api/storage/${cr.getPathString(props.location)}${(await getParentEntry(fileEntry)).fullPath}`, {
                        entity: {
                            type: 'file',
                            name: fileEntry.name,
                            state: 'pending'
                        }
                    });

                    await cr.upload(`/upload/storage/${cr.getPathString(props.location)}${(await getParentEntry(fileEntry)).fullPath}`, fileEntry);
                });
            } else {
                const result = await checkListDialog.show(smulogContainer, {
                    title: '중복된 파일',
                }, {
                    message: '덮어쓸 파일 선택',
                    list: duplicated
                });

                if (result.response === 'positive') {
                    if (result.returns !== undefined) {
                        console.log(result.returns);

                        fileEntryList.filter(entry => !duplicated.includes(entry)).concat(...result.returns.checkedList).forEach(async fileEntry => {
                            await cr.post(`/api/storage/${cr.getPathString(props.location)}${(await getParentEntry(fileEntry)).fullPath}`, {
                                entity: {
                                    type: 'file',
                                    name: fileEntry.name,
                                    state: 'pending'
                                }
                            });

                            await cr.upload(`/upload/storage/${cr.getPathString(props.location)}${(await getParentEntry(fileEntry)).fullPath}`, fileEntry);
                        });
                    }
                }
            }
        }
    };

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
        <FileListContext.Provider
            value={context}>
            <Stack
                sx={props.sx}
                onDrop={onDrop}
                onDragOver={e => {
                    e.preventDefault();
                    // console.log('1');
                }}
                onDragEnter={e => {
                    e.preventDefault();
                    console.log(e);
                }}
                onDragLeave={e => {
                    e.preventDefault();
                    console.log('3');
                }}>

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
                                await createFolder(result.returns.value);
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
                                await createFile(result.returns.value);
                            }
                        }
                    }} />

                <Switch
                    fallback={
                        <For
                            each={createRandomNullArray()}>
                            {(name: null) => (
                                <FileListItem
                                    name={name} />
                            )}
                        </For>
                    }>
                    <Match
                        when={itemList() !== null}>
                        <Show
                            when={props.location.path.length > 0}>
                            <UpItem
                                onClick={e => {
                                    props.onUpClick?.();
                                }} />
                        </Show>
                        <For
                            each={itemNameList()}
                            fallback={
                                <Stack
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    alignItems="center"
                                    justifyContent="center">
                                    <Typography
                                        sx={{
                                            width: 'auto',
                                            height: 'auto',
                                            color: 'text.disabled'
                                        }}>
                                        Empty
                                    </Typography>
                                </Stack>
                            }>
                            {(name, index) => {
                                return (
                                    <FileListItem
                                        name={name}
                                        onClick={e => {
                                            if (name !== null) {
                                                const item = context.getItem(name);

                                                if (item === undefined) {
                                                    throw new Error('Item is undefined');
                                                }

                                                props.onItemClick?.(item);
                                            }
                                        }}
                                        onRename={async () => {
                                            const result = await promptDialog.show(smulogContainer, {
                                                title: 'Rename',
                                                cancelOnTouchOutside: true,
                                            }, {
                                                message: 'Enter new name',
                                                label: 'New name',
                                                default: name
                                            });

                                            if (result.response === 'positive') {
                                                if (result.returns !== undefined) {
                                                    await renameItem(name, result.returns.value);
                                                }
                                            }
                                        }}
                                        onDelete={async () => {
                                            const result = await alertDialog.show(smulogContainer, {
                                                title: 'Delete',
                                                cancelOnTouchOutside: true,
                                            }, {
                                                message: `'${name}' will be deleted. Are you sure?`,
                                            });

                                            if (result.response === 'positive') {
                                                await deleteItem(name);
                                            }
                                        }} />
                                );
                            }}
                        </For>
                    </Match>
                </Switch>
            </Stack>
        </FileListContext.Provider>
    );
};
