import { useTheme } from '@suid/material';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { createEffect, createSignal } from 'solid-js';
import { createSmulog, useDialog } from '~/public/smulog/smulog';

interface PromptDialogReturns {
    value: string;
}

interface PromptDialogProps {
    message: string;
    label?: string;
    default?: string;
}

const promptDialog = createSmulog<PromptDialogReturns, PromptDialogProps>((props: PromptDialogProps) => {
    const theme = useTheme();
    const [input, setInput] = createSignal<HTMLInputElement>(null!);
    const [value, setValue] = createSignal(props.default ?? '');

    const dialog = useDialog<PromptDialogReturns>();

    createEffect(() => {
        input()?.focus();
    });

    dialog.setButtons({
        positive: () => (
            <Button
                sx={{
                    color: theme.palette.text.primary
                }}
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
            <TextField
                value={value()}
                onChange={(event, value) => {
                    setValue(value);
                }}
                onKeyPress={e => {
                    if (e.key === 'Enter') {
                        dialog.close({
                            response: 'positive',
                            returns: {
                                value: value()
                            }
                        });
                    }
                }}
                label={props.label}
                inputRef={setInput} />
        </Stack>
    );
});

export default promptDialog;
