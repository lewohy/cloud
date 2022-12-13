import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { createSmulog, useDialog } from '~/public/dialogs/dialog';
import Button from '@suid/material/Button';

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
