import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { createSmulog, useDialog } from '~/public/smulog/smulog';
import Button from '@suid/material/Button';
import { useTheme } from '@suid/material';

interface AlertDialogReturns {
   
}

interface AlertDialogProps {
    message: string;
}

const alertDialog = createSmulog<AlertDialogReturns, AlertDialogProps>((props: AlertDialogProps) => {
    const theme = useTheme();

    const dialog = useDialog<AlertDialogReturns>();

    dialog.setButtons({
        positive: () => (
            <Button
                sx={{
                    color: theme.palette.text.primary
                }}
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
                sx={{
                    color: theme.palette.text.primary
                }}
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
                sx={{
                    color: theme.palette.text.primary
                }}
                variant='body1'>
                {props.message}
            </Typography>
        </Stack>
    );
});

export default alertDialog;
