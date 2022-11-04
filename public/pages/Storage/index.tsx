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
import { purple, grey } from '@suid/material/colors';
import Modal from '@suid/material/Modal';

type StorageParams = Record<'scope' | 'path', string>;

export interface StorageProps {

}


const theme = createTheme({
    palette: {
        background: {
            paper: '#ffffff'
        },
        primary: {
            main: grey['500']
        }
    },
    typography: {
        fontFamily: `'Noto Sans KR', sans-serif`
    }
});

export const Storage = (props: StorageProps) => {

    const params = useParams<StorageParams>();

    const scope = createMemo(() => params.scope);
    const path = createMemo(() => params.path.length === 0 ? [] : params.path.split('/'));
    const navigate = useNavigate();

    console.log(scope());

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
                            <PathItem
                                href={`/storage/${scope()}`}
                                text={scope()} />
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
                        path={path()}
                        onUpClick={() => {
                            navigate(`/storage/${scope()}/${path().slice(0, -1).join('/')}`);
                        }}
                        onItemClick={item => {
                            navigate(`/storage/${scope()}/${path().concat(item.name).join('/')}`);
                        }} />
                </Stack>
            </Container>
        </ThemeProvider>
    );

};
