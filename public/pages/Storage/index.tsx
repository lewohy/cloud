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
import { createEffect, createMemo, createSignal, For } from 'solid-js';
import { FileList } from '~/public/components/FileList';
import { purple, grey, blue } from '@suid/material/colors';
import Modal from '@suid/material/Modal';
import { ScrollView } from '~/public/components/ScrollView';

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
        },
        secondary: {
            main: blue['400']
        }
    },
    typography: {
        fontFamily: `'Noto Sans KR', sans-serif`
    }
});

export const Storage = (props: StorageProps) => {

    const params = useParams<StorageParams>();
    const location = createMemo(() => ({
        scope: params.scope,
        path: params.path.length === 0 ? [] : params.path.split('/')
    }));
    const navigate = useNavigate();

    console.log(location().scope);

    const [arr, setArr] = createSignal([
        {
            id: 3
        },
        {
            id: 2
        }
    ]);

    return (
        <ThemeProvider
            theme={theme}>
            <ScrollView>
                <Container
                    maxWidth="md"
                    sx={{
                        height: 'auto',
                        minHeight: '100%',
                        display: 'flex',
                    }}>
                    <Stack
                        sx={{
                            width: '100%',
                            height: 'auto',
                            minHeight: '100%',
                            marginLeft: '24px',
                            marginRight: '24px',
                        }}
                        onClick={e => {
                            const a = arr().concat({
                                    id: 0
                                }
                            );

                            a.sort((a, b) => a.id - b.id);
                            setArr(a);
                        }}>
                        <For each={arr()}>
                            {(item, index) => {
                                console.log(index());
                                return item.id;
                            }}
                        </For>

                        <Stack>
                            <Typography variant='h3'>{location().scope}</Typography>

                            <Breadcrumbs
                                sx={{
                                    margin: '16px 0px',
                                }}>
                                <PathItem
                                    href={`/storage/${location().scope}`}
                                    text={location().scope} />
                                <For each={location().path}>
                                    {(item: string, index: () => number) => (
                                        // TODO: 매우 길어진 경우에 처리하기
                                        <PathItem
                                            href={`/storage/${location().scope}/${location().path.slice(0, index() + 1).join('/')}`}
                                            text={item} />
                                    )}
                                </For>
                            </Breadcrumbs>
                        </Stack>
                        <FileList
                            sx={{
                                height: '100%',
                                flexGrow: 1
                            }}
                            location={location()}
                            onUpClick={() => {
                                navigate(`/storage/${location().scope}/${location().path.slice(0, -1).join('/')}`);
                            }}
                            onItemClick={item => {
                                navigate(`/storage/${location().scope}/${location().path.concat(item.name).join('/')}`);
                            }} />
                    </Stack>
                </Container>
            </ScrollView>
        </ThemeProvider>
    );

};
