import { ContentCopy, ContentCut, DeleteOutline, DeleteOutlined, DriveFileRenameOutline, MoreVert } from '@suid/icons-material';
import Fade from '@suid/material/Fade';
import IconButton from '@suid/material/IconButton';
import Popover from '@suid/material/Popover';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { RippleBase } from '~/public/components/RippleBase';
import { createEffect, createMemo, createSignal, For, JSX } from 'solid-js';
import { useFileListItem } from '..';
import { ListItemIcon, ListItemText, Menu, MenuItem, MenuList } from '@suid/material';

export interface MenuItem {
    icon: () => JSX.Element;
    text: string;
    onClick: () => void;
}

export interface FileListItemMenuProps {
    menuItemList: MenuItem[];
}

export const FileListItemMenu = (props: FileListItemMenuProps) => {
    const [anchorEl, setAnchorEl] = createSignal<HTMLElement | null>(null);
    const expend = createMemo(() => anchorEl() !== null);

    return (
        <Stack
            direction="row"
            sx={{
                width: '40px',
                height: '40px',
            }}>

            <IconButton
                onClick={e => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                }}
                onMouseDown={e => {
                    e.stopPropagation();
                }}>
                <MoreVert />
            </IconButton>

            <Menu
                anchorEl={anchorEl()}
                open={expend()}
                onClick={e => {
                    e.stopPropagation();
                }}
                onMouseDown={e => {
                    e.stopPropagation();
                }}
                onClose={() => {
                    setAnchorEl(null);
                }}>
                <For each={props.menuItemList}>
                    {item => (
                        <MenuItem
                            onClick={e => {
                                setAnchorEl(null);
                                item.onClick();
                            }}>
                            <ListItemIcon>
                                {item.icon()}
                            </ListItemIcon>
                            <ListItemText>
                                {item.text}
                            </ListItemText>
                        </MenuItem>
                    )}
                </For>
            </Menu>
        </Stack>
    );
};
