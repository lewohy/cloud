import FolderOutlined from '@suid/icons-material/FolderOutlined';
import { useTheme } from '@suid/material';
import ButtonBase from '@suid/material/ButtonBase';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import dayjs from 'dayjs';
import { JSX } from 'solid-js';
import { RippleBase, RippleBaseProps } from '~/public/components/RippleBase';

export interface FileListItemProps {
    item?: cloud.Item;
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
                    props.item !== undefined &&
                    <>
                        <FolderOutlined
                            sx={{
                                fontSize: '48px'
                            }} />

                        <Stack
                            spacing="8px"
                            alignContent="start"
                            direction="column">
                            <Typography
                                sx={{
                                    display: 'flex'
                                }}
                                variant="h6">
                                {props.item?.name}
                            </Typography>

                            <Typography
                                sx={{
                                    display: 'flex'
                                }}
                                variant="subtitle1">
                                {
                                    dayjs(props.item?.createdTime).format('YYYY-MM-DD HH:mm:ss')
                                }
                            </Typography>
                        </Stack>
                    </>
                }

                {
                    props.item === undefined &&
                    <>
                        <FolderOutlined
                            sx={{
                                fontSize: '48px'
                            }} />

                        <Stack
                            spacing="8px"
                            alignContent="start"
                            direction="column">
                            <Typography
                                sx={{
                                    display: 'flex'
                                }}
                                variant="h6">
                                ..
                            </Typography>
                        </Stack>
                    </>
                }
            </Stack>
        </RippleBase>
    );
};
