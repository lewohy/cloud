import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { createSmulog, useDialog } from '~/public/dialogs/dialog';
import { createSignal } from 'solid-js';
import Button from '@suid/material/Button';

interface PromptDialogReturns {
    value: string;
}

interface PromptDialogProps {
    message: string;
    label?: string;
}

const promptDialog = createSmulog<PromptDialogReturns, PromptDialogProps>((props: PromptDialogProps) => {
    const [value, setValue] = createSignal('');

    const dialog = useDialog<PromptDialogReturns>();
    
    dialog.setButtons({
        positive: () => (
            <Button
                onClick={e => {
                    dialog.close({
                        response: 'positive',
                        returns: {
                            value: value()
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
    })

    return (
        <Stack
            direction="column"
            spacing={1}>
            <Typography>{props.message}</Typography>
            <TextField
                value={value()}
                onChange={(event, value) => {
                    setValue(value);
                }}
                label={props.label} />
        </Stack>
    );
});

export default promptDialog;
