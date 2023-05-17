import { useNavigate } from '@solidjs/router';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { JSX, createSignal } from 'solid-js';
import { ScrollView } from '~/public/components/ScrollView';

export interface ScopeProps {

}

export const Scope = (props: ScopeProps) => {
    const navigate = useNavigate();
    const [scopeName, setScopeName] = createSignal('');
    const onUseClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = async e => {
        if (scopeName().length === 0) {
            return;
        }
        location.pathname = `/storage/${scopeName()}`;
    };

    return (
        <Stack
            sx={{
                width: '100%',
                height: '100%',
                backgroundColor: 'secondary.main'
            }}
            justifyContent="center"
            alignItems="center">
            <ScrollView>
                <Stack
                    sx={{
                        width: '100%',
                        height: '100%'
                    }}
                    justifyContent="center"
                    alignItems="center">

                            
                    <Stack
                        sx={{
                            width: '100%',
                            height: '100%',
                            maxWidth: '640px',
                            maxHeight: '400px',
                            padding: '64px',
                            borderRadius: '8px',
                            backgroundColor: 'background.default'
                        }}
                        justifyContent="start"
                        alignItems="start"
                        spacing={1}>
                        <Stack
                            direction="column"
                            sx={{
                                width: '100%',
                            }}
                            spacing="5px">
                            <Typography
                                sx={{
                                    color: 'text.primary'
                                }}
                                variant="h4">
                                        Input Scope Name
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'text.primary'
                                }}>
                                        Create a new scope or use an existing scope.
                            </Typography>
                        </Stack>

                        <Stack
                            sx={{
                                width: '100%',
                                flex: '1'
                            }}
                            justifyContent="center">
                            <TextField
                                label="scope"
                                variant="outlined"
                                autoComplete="off"
                                value={scopeName()}
                                onChange={(e, value) => setScopeName(value)}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        navigate(`/storage/${scopeName()}`);
                                    }
                                }} />
                        </Stack>

                        <Stack
                            sx={{
                                width: '100%',
                            }}
                            alignItems="end">
                            <Button
                                variant='contained'
                                onClick={onUseClick}>
                                        Use
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </ScrollView>
        </Stack>
    );
};
