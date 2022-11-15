import FolderOutlined from '@suid/icons-material/FolderOutlined';
import InsertDriveFile from '@suid/icons-material/InsertDriveFile';
import LinearProgress from '@suid/material/LinearProgress';
import Skeleton from '@suid/material/Skeleton';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import dayjs from 'dayjs';
import { createMemo, JSX, Match, Switch } from 'solid-js';
import { isFile, isFileEntry } from '~/public/ts/typeguard';
import { RippleBase, RippleBaseProps } from '~/public/components/RippleBase';
import { useFileList } from '..';
import { FileListItemMenu } from './FileListItemMenu';
import { useDialogContainer } from '~/public/dialogs/dialog';
import promptDialog from '~/public/dialogs/PromptDialog';
import alertDialog from '~/public/dialogs/AlertDialog';

export interface FileListItemProps {
    name: string | null;
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
    onRename?: () => void;
    onDelete?: () => void;
}

export const FileListItem = (props: FileListItemProps) => {
    const smulogContainer = useDialogContainer();
    const fileList = useFileList();
    const item = createMemo(() => {
        return fileList.getItem(props.name);
    });

    const getUploadProgress = (item?: cloud.Item | null) => {
        if (isFile(item)) {
            return item.uploaded / item.size * 100;
        }

        return 0;
    };

    return (
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
                            <FolderOutlined
                                sx={{
                                    fontSize: '48px'
                                }} />
                        </Match>

                        <Match
                            when={item()?.type === 'file'}>
                            <InsertDriveFile
                                sx={{
                                    fontSize: '48px'
                                }} />
                        </Match>
                    </Switch>
                </Stack>

                <Stack
                    spacing="8px"
                    alignContent="start"
                    direction="column"
                    sx={{
                        width: '100%',
                    }}>

                    <Typography
                        sx={{
                            display: 'flex'
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


                    <Typography
                        sx={{
                            display: 'flex'
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
                </Stack>

                <FileListItemMenu
                    onRename={props.onRename}
                    onDelete={props.onDelete}/>
            </Stack>
        </RippleBase >
    );
};
