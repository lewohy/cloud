import { DeleteOutline, DriveFileRenameOutline, Folder, InsertDriveFileOutlined, ShareOutlined } from '@suid/icons-material';
import { useTheme } from '@suid/material';
import LinearProgress from '@suid/material/LinearProgress';
import Skeleton from '@suid/material/Skeleton';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import dayjs from 'dayjs';
import { createContext, createMemo, JSX, Match, Show, Switch, useContext } from 'solid-js';
import { RippleBase } from '~/public/components/RippleBase';
import { ScrollView } from '~/public/components/ScrollView';
import alertDialog from '~/public/smulog/AlertDialog';
import copyDialog from '~/public/smulog/CopyDialog';
import promptDialog from '~/public/smulog/PromptDialog';
import { useDialogContainer } from '~/public/smulog/smulog';
import { getPathString } from '~/public/ts/location';
import share from '~/public/ts/request/share';
import storage from '~/public/ts/request/storage';
import { isFile } from '~/public/ts/typeguard';
import { useFileList } from '..';
import { FileListItemMenu } from './FileListItemMenu';

interface FileListItemContext {
    getItem(): cloud.Item | null;
}

const FileListItemContext = createContext<FileListItemContext>();

export function useFileListItem(): FileListItemContext {
    const context = useContext(FileListItemContext);

    if (context === undefined) {
        throw new Error('Component must be used within a FileListItem.');
    }

    return context;
}

export interface FileListItemProps {
    name: string | null;
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

export const FileListItem = (props: FileListItemProps) => {
    const theme = useTheme();
    const smulogContainer = useDialogContainer();

    const fileList = useFileList();
    const item = createMemo(() => {
        return fileList.getItem(props.name);
    });

    const context: FileListItemContext = {
        getItem() {
            return item();
        }
    };

    const getUploadProgress = (item?: cloud.Item | null) => {
        if (isFile(item)) {
            return item.uploaded / item.size * 100;
        }

        return 0;
    };

    const renameItem = async (name: string, newName: string) => {
        try {
            const result = await storage.put(`/api/storage/${getPathString(fileList.getLocation())}/${name}`, {
                name: newName
            });
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };

    const deleteItem = async (name: string) => {
        try {
            const result = await storage.delete(`/api/storage/${getPathString(fileList.getLocation())}/${name}`);
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };

    return (
        <FileListItemContext.Provider
            value={context}>
            <RippleBase
                sx={{
                    width: '100%',
                    height: 'auto',
                    padding: '24px',
                    cursor: 'pointer'
                }}
                onClick={props.onClick}>
                <Stack
                    sx={{
                        width: '100%',
                        height: 'auto'
                    }}
                    spacing="24px"
                    alignItems="center"
                    direction="row">


                    <Stack
                        sx={{
                            width: '48px',
                            height: '48px',
                        }}>
                        <Switch
                            fallback={
                                <Skeleton
                                    variant='rectangular'
                                    width={48}
                                    height={48}
                                    sx={{
                                        borderRadius: '8px'
                                    }} />
                            }>
                            <Match
                                when={item()?.type === 'directory'}>
                                <Folder
                                    sx={{
                                        fontSize: '48px',
                                        color: theme.palette.text.primary
                                    }} />
                            </Match>

                            <Match
                                when={item()?.type === 'file'}>
                                <InsertDriveFileOutlined
                                    sx={{
                                        fontSize: '48px',
                                        color: theme.palette.text.primary
                                    }} />
                            </Match>
                        </Switch>
                    </Stack>

                    <Stack
                        spacing="8px"
                        alignContent="start"
                        direction="column"
                        sx={{
                            width: '0px',
                            flex: '1 1 auto'
                        }}>
                        <ScrollView
                            showScrollbar={false}>

                            <Typography
                                sx={{
                                    display: 'flex',
                                    whiteSpace: 'nowrap',
                                    color: theme.palette.text.primary
                                }}
                                variant="h6">
                                <Switch
                                    fallback={
                                        <Skeleton
                                            sx={{
                                                width: '100%',
                                                height: '100%'
                                            }}
                                            variant="text" />
                                    }>
                                    <Match
                                        when={item()?.name !== undefined}>
                                        {item()?.name}
                                    </Match>
                                </Switch>
                            </Typography>
                        </ScrollView>

                        <ScrollView
                            showScrollbar={false}>
                            <Typography
                                sx={{
                                    display: 'flex',
                                    whiteSpace: 'nowrap',
                                    color: theme.palette.text.secondary
                                }}
                                variant="subtitle2">
                                <Switch
                                    fallback={
                                        <Skeleton
                                            sx={{
                                                width: '100%',
                                                height: '100%'
                                            }}
                                            variant="text" />
                                    }>
                                    <Match
                                        when={item()?.state === 'normal'}>
                                        {dayjs(item()?.createdTime).format('YYYY-MM-DD HH:mm:ss')}
                                    </Match>
                                    <Match
                                        when={item()?.state === 'uploading'}>
                                        <Stack
                                            sx={{
                                                width: '100%',
                                                height: '1.57em', // NOTE: line-height를 직접 가져오는 방법 없는지?
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                            <LinearProgress
                                                sx={{
                                                    width: '100%',
                                                }}
                                                variant="determinate"
                                                color='secondary'
                                                value={getUploadProgress(item())} />
                                        </Stack>
                                    </Match>
                                </Switch>
                            </Typography>
                        </ScrollView>
                    </Stack>

                    <Show
                        when={item()?.state === 'normal'}>
                        <FileListItemMenu
                            menuItemList={[
                                {
                                    icon: () => <DriveFileRenameOutline
                                        sx={{
                                            color: theme.palette.text.secondary
                                        }} />,
                                    text: 'Rename',
                                    onClick: async () => {
                                        const name = item()?.name;
                                        if (name !== undefined) {
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
                                        }
                                    }
                                },
                                {
                                    icon: () => <DeleteOutline
                                        sx={{
                                            color: theme.palette.text.secondary
                                        }} />,
                                    text: 'Delete',
                                    onClick: async () => {
                                        const name = item()?.name;
                                        if (name !== undefined) {
                                            const result = await alertDialog.show(smulogContainer, {
                                                title: 'Delete',
                                                cancelOnTouchOutside: true,
                                            }, {
                                                message: `'${name}' will be deleted. Are you sure?`,
                                            });

                                            if (result.response === 'positive') {
                                                await deleteItem(name);
                                            }
                                        }
                                    }
                                },
                                ...(item()?.type === 'file' ? [
                                    {
                                        icon: () => <ShareOutlined />,
                                        text: 'Share',
                                        onClick: async () => {
                                            const name = item()?.name;

                                            if (name !== undefined) {
                                                const location = fileList.getLocation();
                                                const response = await share.post(getPathString({
                                                    scope: location.scope,
                                                    path: [...location.path, name]
                                                }), {});

                                                const result = await copyDialog.show(smulogContainer, {
                                                    title: 'Share',
                                                    cancelOnTouchOutside: true,
                                                }, {
                                                    message: 'Copy the link below',
                                                    value: `${globalThis.location.host}/share/${response.shareId}`
                                                });

                                            }
                                        }
                                    }
                                ] : [])
                            ]} />
                    </Show>
                </Stack>
            </RippleBase>
        </FileListItemContext.Provider>
    );
};