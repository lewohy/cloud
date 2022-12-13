import { DeleteOutline, DeleteOutlined, DriveFileRenameOutline, MoreVert } from '@suid/icons-material';
import Fade from '@suid/material/Fade';
import IconButton from '@suid/material/IconButton';
import Popover from '@suid/material/Popover';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { RippleBase } from '~/public/components/RippleBase';
import { createSignal, For, JSX } from 'solid-js';

export interface MenuItem {
    icon: JSX.Element;
    text: string;
    onClick: () => void;
}

export interface FileListItemMenuProps {
    menuItemList: MenuItem[];
}

export const FileListItemMenu = (props: FileListItemMenuProps) => {
    const [expend, setExpend] = createSignal(false);
    const [anchorEl, setAnchorEl] = createSignal<HTMLElement | null>(null);
    return (
        <Stack
            direction="row"
            sx={{
                width: '40px',
                height: '40px',
            }}>

            <IconButton
                ref={setAnchorEl}
                onClick={e => {
                    e.stopPropagation();
                    setExpend(!expend());
                }}
                onMouseDown={e => {
                    e.stopPropagation();
                }}>
                <MoreVert />
            </IconButton>

            <Popover
                open={expend()}
                anchorEl={anchorEl()}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClick={e => {
                    e.stopPropagation();
                }}
                onMouseDown={e => {
                    e.stopPropagation();
                }}
                onClose={e => {
                    setExpend(false);
                }}>
                <Stack
                    direction="column" >
                    <For each={props.menuItemList}>
                        {item => (
                            <RippleBase>
                                <Stack
                                    sx={{
                                        width: '100%',
                                        padding: '8px',
                                        justifyContent: 'flex-start'
                                    }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setExpend(false);
                                        item.onClick();
                                    }}
                                    direction="row"
                                    justifyContent="center"
                                    spacing="8px" >

                                    {item.icon}

                                    <Typography
                                        variant='body1'>
                                        {item.text}
                                    </Typography>
                                </Stack>
                            </RippleBase>
                        )}
                    </For>
                </Stack>
            </Popover>
        </Stack>
    );
};
