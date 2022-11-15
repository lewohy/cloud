import { DeleteOutline, DriveFileRenameOutline, MoreVert } from '@suid/icons-material';
import Fade from '@suid/material/Fade';
import IconButton from '@suid/material/IconButton';
import Stack from '@suid/material/Stack';
import { createSignal, Show } from 'solid-js';

export interface FileListItemMenuProps {
    onRename?: () => void;
    onDelete?: () => void;
}

export const FileListItemMenu = (props: FileListItemMenuProps) => {
    const [expend, setExpend] = createSignal(false);

    return (
        <Stack
            direction="row">

            <Fade
                in={expend()}>
                <Stack
                    direction="row">
                    <IconButton
                        onClick={e => {
                            e.stopPropagation();
                            props.onRename?.();
                        }}
                        onMouseDown={e => {
                            e.stopPropagation();
                        }}>
                        <DriveFileRenameOutline />
                    </IconButton>

                    <IconButton
                        onClick={e => {
                            e.stopPropagation();
                            props.onDelete?.();
                        }}
                        onMouseDown={e => {
                            e.stopPropagation();
                        }}>
                        <DeleteOutline />
                    </IconButton>
                </Stack>
            </Fade>

            <IconButton
                onClick={e => {
                    e.stopPropagation();
                    setExpend(!expend());
                }}
                onMouseDown={e => {
                    e.stopPropagation();
                }}>
                <MoreVert />
            </IconButton>
        </Stack>
    );
};
