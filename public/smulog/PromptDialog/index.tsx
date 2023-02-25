import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { createSmulog, useDialog } from '~/public/smulog/smulog';
import { createEffect, createSignal } from 'solid-js';
import Button from '@suid/material/Button';

interface PromptDialogReturns {
    value: string;
}

interface PromptDialogProps {
    message: string;
    label?: string;
    default?: string;
}

const promptDialog = createSmulog<PromptDialogReturns, PromptDialogProps>((props: PromptDialogProps) => {
    const [input, setInput] = createSignal<HTMLInputElement>(null!);
    const [value, setValue] = createSignal(props.default ?? '');

    const dialog = useDialog<PromptDialogReturns>();

    createEffect(() => {
        input()?.focus();
    });

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
            <Typography
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
