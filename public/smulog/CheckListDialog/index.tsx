import Button from '@suid/material/Button';
import Checkbox from '@suid/material/Checkbox';
import Divider from '@suid/material/Divider';
import List from '@suid/material/List';
import ListItem from '@suid/material/ListItem';
import ListItemButton from '@suid/material/ListItemButton';
import ListItemIcon from '@suid/material/ListItemIcon';
import ListItemText from '@suid/material/ListItemText';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { createSignal, For } from 'solid-js';
import { ScrollView } from '~/public/components/ScrollView';
import { createSmulog, useDialog } from '~/public/smulog/smulog';
import Box from '@suid/material/Box';

export interface CheckListDialogReturns {
    checkedList: FileSystemFileEntry[];
}

export interface CheckListDialogProps {
    message: string;
    list: FileSystemFileEntry[];
}

export const checkListDialog = createSmulog<CheckListDialogReturns, CheckListDialogProps>((props: CheckListDialogProps) => {
    const dialog = useDialog<CheckListDialogReturns>();
    const [checkedList, setCheckedItem] = createSignal<FileSystemFileEntry[]>([...props.list]);

    dialog.setButtons({
        positive: () => (
            <Button
                onClick={e => {
                    dialog.close({
                        response: 'positive',
                        returns: {
                            checkedList: checkedList()
                        }
                    });
                }}>
                OK
            </Button>
        ),
        negative: () => (
            <Button
                onClick={e => {
                    dialog.close();
                }}>
                Cancel
            </Button>
        )
    });

    return (
        <Stack
            sx={{
                height: 'auto',
                maxHeight: '100%'
            }}
            direction="column">
            <Typography
                variant='body1'>
                {props.message}
            </Typography>

            <ListItem
                disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <Checkbox
                            checked={props.list.every(item => checkedList().findIndex(e => e.name == item.name) !== -1)}
                            onChange={e => {
                                if (!e.target.checked) {
                                    setCheckedItem(props.list);
                                } else {
                                    setCheckedItem([]);
                                }
                            }} />
                    </ListItemIcon>

                    <ListItemText
                        primary="All" />
                </ListItemButton>
            </ListItem>
            <Divider />
            <Stack
                sx={{
                    flex: 1,
                    height: '0px',
                }}>
                <ScrollView>
                    <List>
                        <For
                            each={props.list}>
                            {item => (
                                <ListItem
                                    disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <Checkbox
                                                checked={checkedList().findIndex(e => e.name === item.name) !== -1}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setCheckedItem(checkedList().filter(e => e.name !== item.name));
                                                    } else {
                                                        setCheckedItem([...checkedList(), item]);
                                                    }
                                                }} />
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={`.${item.fullPath}`} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </For>
                    </List>
                </ScrollView>
            </Stack>
        </Stack>
    );
});
