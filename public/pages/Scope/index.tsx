import { useLocation } from '@solidjs/router';
import { createTheme, ThemeProvider } from '@suid/material';
import Button from '@suid/material/Button';
import Card from '@suid/material/Card';
import CardActions from '@suid/material/CardActions';
import CardContent from '@suid/material/CardContent';
import { blue, grey } from '@suid/material/colors';
import Container from '@suid/material/Container';
import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { createSignal } from 'solid-js';
import { JSX } from 'solid-js';
import { ScrollView } from '~/public/components/ScrollView';
import { SmulogContainer } from '~/public/dialogs/dialog';

export interface ScopeProps {

}

const theme = createTheme({
    palette: {
        background: {
            paper: '#f1f1f1'
        },
        primary: {
            main: grey['500']
        },
        secondary: {
            main: '#ffffff'
        }
    },
    typography: {
        fontFamily: `'Noto Sans KR', sans-serif`
    }
})

export const Scope = (props: ScopeProps) => {
    const [scopeName, setScopeName] = createSignal('');
    const onUseClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = async e => {
        location.pathname = `/storage/${scopeName()}`;
    };

    return (
        <ThemeProvider
            theme={theme}>
            <SmulogContainer>
                <Stack
                    sx={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: theme.palette.background.paper,
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
                                    backgroundColor: theme.palette.secondary.main,
                                }}
                                justifyContent="start"
                                alignItems="start">
                                <Stack
                                    direction="column"
                                    sx={{
                                        width: '100%',
                                    }}
                                    spacing="5px">
                                    <Typography
                                        variant="h4">
                                        Input Scope Name
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: theme.palette.text.secondary
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
                                        fullWidth/>
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
            </SmulogContainer>
        </ThemeProvider >
    );
};
