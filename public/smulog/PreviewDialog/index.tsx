import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { createSmulog, useDialog } from '~/public/smulog/smulog';
import Button from '@suid/material/Button';
import { createEffect, createMemo, createSignal, Match, Switch } from 'solid-js';
import { Box, CircularProgress } from '@suid/material';
import { editor } from 'monaco-editor';
import { ScrollView } from '~/public/components/ScrollView';
import { CodeView } from '~/public/components/CodeView';
import storage from '~/public/ts/request/storage';
import axios from 'axios';

interface PreviewDialogReturns {
   
}

interface PreviewDialogProps {
    mimeType: string | null;
    downloadUrl: string;
}

const previewDialog = createSmulog<PreviewDialogReturns, PreviewDialogProps>((props: PreviewDialogProps) => {
    const [text, setText] = createSignal<string | null>(null);
    const type = createMemo(() => {
        if (props.mimeType === null) {
            return null;
        }

        return props.mimeType.split('/')[1];
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
        setText((await axios.get(props.downloadUrl)).data);
    });

    return (
        <Stack
            direction="column"
            spacing={1}>
            <Switch>
                <Match
                    when={props.mimeType?.startsWith('image')}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <img
                            src={props.downloadUrl}
                            style={{
                                'max-width': '100%',
                                'max-height': '50vh'
                            }}/>
                    </Box>
                </Match>  
                <Match
                    when={props.mimeType?.startsWith('video')}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <video
                            src={props.downloadUrl}
                            controls
                            style={{
                                'max-width': '100%',
                                'max-height': '50vh'
                            }}/>
                    </Box>
                </Match>
                <Match
                    when={props.mimeType?.startsWith('text')}>
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
