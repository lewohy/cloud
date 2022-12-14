import { useParams, useNavigate } from '@solidjs/router'
import { createTheme, ThemeProvider } from '@suid/material';
import Breadcrumbs from '@suid/material/Breadcrumbs';
import Container from '@suid/material/Container';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { PathItem } from '~/public/components/PathItem';
import { createEffect, createMemo, For } from 'solid-js';
import { FileList } from '~/public/components/FileList';
import { grey, blue } from '@suid/material/colors';
import { ScrollView } from '~/public/components/ScrollView';
import { SmulogContainer } from '~/public/dialogs/dialog';
import storage from 'ts/request/storage';
import { getPathString } from 'ts/location';

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
    const location = createMemo<cloud.Location>(() => ({
        scope: params.scope,
        path: params.path.length === 0 ? [] : params.path.split('/')
    }));
    const navigate = useNavigate();

    createEffect(() => {
        document.title = `${getPathString(location())}`;
    });

    return (
        <ThemeProvider
            theme={theme}>
            <SmulogContainer>
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
                                marginLeft: '4px',
                                marginRight: '4px',
                            }}>

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
                                    if (item.type === 'directory') {
                                        // TODO: path??? item name??? ??? ????????? ?????? join ??????
                                        navigate(`/storage/${location().scope}/${[...location().path, item.name].join('/')}`);
                                    } else {
                                        window.open(`/storage/${location().scope}/${location().path.concat(item.name).join('/')}`);
                                    }
                                }} />
                        </Stack>
                    </Container>
                </ScrollView>
            </SmulogContainer>
        </ThemeProvider>
    );

};
