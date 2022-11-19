import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { createSmulog, useDialog } from '~/public/dialogs/dialog';
import { createSignal } from 'solid-js';
import Button from '@suid/material/Button';
import List from '@suid/material/List';
import { FileListItem } from 'components/FileList/FileListItem';
import ListItem from '@suid/material/ListItem';
import ListItemButton from '@suid/material/ListItemButton';
import ListItemText from '@suid/material/ListItemText';

interface AlertDialogReturns {
   
}

interface AlertDialogProps {
    message: string;
}

const alertDialog = createSmulog<AlertDialogReturns, AlertDialogProps>((props: AlertDialogProps) => {

    const dialog = useDialog<AlertDialogReturns>();

    dialog.setButtons({
        positive: () => (
            <Button
                onClick={e => {
                    dialog.close({
                        response: 'positive'
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
    })

    return (
        <Stack
            direction="column"
            spacing={1}>
            <Typography
                variant='body1'>
                {props.message}
            </Typography>
        </Stack>
    );
});

export default alertDialog;
