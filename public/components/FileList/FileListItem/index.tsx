import FolderOutlined from '@suid/icons-material/FolderOutlined';
import InsertDriveFile from '@suid/icons-material/InsertDriveFile';
import { useTheme } from '@suid/material';
import ButtonBase from '@suid/material/ButtonBase';
import Skeleton from '@suid/material/Skeleton';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import dayjs from 'dayjs';
import { JSX } from 'solid-js';
import { RippleBase, RippleBaseProps } from '~/public/components/RippleBase';

export interface FileListItemProps {
    item: cloud.Item | null;
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

export const FileListItem = (props: FileListItemProps) => {

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

                {
                    props.item === null &&
                    <Skeleton
                        variant='rectangular'
                        width={48}
                        height={48}
                        sx={{
                            borderRadius: '8px'
                        }} />
                }

                {
                    props.item?.type === 'directory' &&
                    <FolderOutlined
                        sx={{
                            fontSize: '48px'
                        }} />
                }

                {
                    props.item?.type === 'file' &&
                    <InsertDriveFile
                        sx={{
                            fontSize: '48px'
                        }} />
                }

                <Stack
                    spacing="8px"
                    alignContent="start"
                    direction="column">

                    {
                        <Typography
                            sx={{
                                display: 'flex'
                            }}
                            variant="h6">
                            {
                                props.item === null ?
                                <Skeleton
                                    variant="text"
                                    width={100} /> :
                                props.item.name
                            }
                        </Typography>
                    }

                    <Typography
                        sx={{
                            display: 'flex'
                        }}
                        variant="subtitle1">
                        {
                            props.item === null ?
                                <Skeleton
                                    variant="text"
                                    width={100} /> :
                                dayjs(props.item?.createdTime).format('YYYY-MM-DD HH:mm:ss')
                        }
                    </Typography>
                </Stack>
            </Stack>
        </RippleBase>
    );
};
