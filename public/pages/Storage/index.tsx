import { useParams, useLocation, useNavigate } from '@solidjs/router'
import { createTheme, ThemeProvider } from '@suid/material';
import Box from '@suid/material/Box';
import Breadcrumbs from '@suid/material/Breadcrumbs';
import Button from "@suid/material/Button";
import Container from '@suid/material/Container';
import Link from '@suid/material/Link';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { PathItem } from '~/public/components/PathItem';
import { createEffect, createMemo, For } from 'solid-js';
import { FileList } from '~/public/components/FileList';

type StorageParams = Record<'scope' | 'path', string>;

export interface StorageProps {

}

const theme = createTheme({
    palette: {
        background: {
            paper: '#ffffff'
        }
    },
    typography: {
        fontFamily: `'Noto Sans KR', sans-serif`
    }
});

export const Storage = (props: StorageProps) => {
    const params = useParams<StorageParams>();

    const scope = createMemo(() => params.scope);
    const path = createMemo(() => params.path.split('/'));


    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md">
                <Stack
                    sx={{
                        marginTop: '24px',
                        marginLeft: '24px',
                        marginRight: '24px'
                    }}>
                    <Stack>
                        <Typography variant='h3'>{scope}</Typography>

                        <Breadcrumbs
                            sx={{
                                margin: '16px 0px',
                            }}>
                            <For each={path()}>
                                {(item: string, index: () => number) => (
                                    // TODO: 매우 길어진 경우에 처리하기
                                    <PathItem
                                        href={`/storage/${scope()}/${path().slice(0, index() + 1).join('/')}`}
                                        text={item} />
                                )}
                            </For>
                        </Breadcrumbs>
                    </Stack>
                    <FileList
                        scope={scope()}
                        path={path()}/>
                </Stack>
            </Container>
        </ThemeProvider>
    );

};