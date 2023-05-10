import { Box, CircularProgress } from '@suid/material';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import axios from 'axios';
import { Match, Switch, createEffect, createMemo, createSignal } from 'solid-js';
import { getDownloadUrl } from '~/public/ts/location';
import { CodeView } from '~/public/components/CodeView';
import { createSmulog, useDialog } from '~/public/smulog/smulog';
import mime from 'mime';

mime.define({
    'text/typescript': ['ts']
}, true);

interface PreviewDialogReturns {
   
}

interface PreviewDialogProps {
    location: cloud.Location;
    file: cloud.File;
}

const previewDialog = createSmulog<PreviewDialogReturns, PreviewDialogProps>((props: PreviewDialogProps) => {
    const mimeType = createMemo(() => mime.getType(props.file.name));
    const [text, setText] = createSignal<string | null>(null);
    const type = createMemo(() => {
        return mimeType()?.split('/')[1] ?? null;
    });

    const dialog = useDialog<PreviewDialogReturns>();

    dialog.setButtons({
        positive: () => (
            <Button
                onClick={e => {
                    dialog.close({
                        response: 'positive'
                    });
                }}>
                Download
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
    });
    
    
    createEffect(() => {
        
        
    });

    createEffect(async () => {
        setText((await axios.get(getDownloadUrl(props.location, props.file))).data);
    });

    return (
        <Stack
            direction="column"
            spacing={1}>
            <Switch>
                <Match
                    when={mimeType()?.startsWith('image')}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <img
                            src={getDownloadUrl(props.location, props.file)}
                            style={{
                                'max-width': '100%',
                                'max-height': '50vh'
                            }}/>
                    </Box>
                </Match>  
                <Match
                    when={mimeType()?.startsWith('video')}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <video
                            src={getDownloadUrl(props.location, props.file)}
                            controls
                            style={{
                                'max-width': '100%',
                                'max-height': '50vh'
                            }}/>
                    </Box>
                </Match>
                <Match
                    when={mimeType()?.startsWith('text')}>
                    <Box
                        sx={{
                            display: 'flex',
                            width: '100%',
                            maxHeight: '50vh',

                        }}>
                        <Switch>
                            <Match
                                when={text() === null} >
                                <CircularProgress />
                            </Match>
                            <Match
                                when={text() !== null}>
                                <CodeView
                                    sx={{
                                        width: '100%',
                                    }}
                                    text={text() ?? ''}
                                    language={type() ?? 'plain'} />
                            </Match>
                        </Switch>
                    </Box>
                </Match>
            </Switch>
        </Stack>
    );
});

export default previewDialog;
