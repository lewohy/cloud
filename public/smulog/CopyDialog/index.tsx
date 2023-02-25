import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { createSmulog, useDialog } from '~/public/smulog/smulog';
import { createSignal } from 'solid-js';
import Button from '@suid/material/Button';
import { IconButton } from '@suid/material';
import { ContentCopyOutlined } from '@suid/icons-material';

interface CopyDialogReturns {

}

interface CopyDialogProps {
    message: string;
    value: string;
    label?: string;
    default?: string;
}

const copyDialog = createSmulog<CopyDialogReturns, CopyDialogProps>((props: CopyDialogProps) => {
    const [value, setValue] = createSignal(props.value ?? '');

    const dialog = useDialog<CopyDialogReturns>();

    dialog.setButtons({
        positive: () => (
            <Button
                onClick={e => {
                    dialog.close({
                        response: 'positive',
                        returns: {

                        }
                    });
                }}>
                OK
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
            <Stack
                direction="row"
                spacing={1}>
                <TextField
                    sx={{
                        flex: '1 1 auto'
                    }}
                    value={value()}
                    label={props.label}
                    InputProps={{
                        readOnly: true
                    }} />
                <Button
                    startIcon={<ContentCopyOutlined />}
                    onClick={async e => {
                        await navigator.clipboard.writeText(value());
                        console.log('copied');
                    }}>
                    Copy Link
                </Button>
            </Stack>
        </Stack>
    );
});

export default copyDialog;
