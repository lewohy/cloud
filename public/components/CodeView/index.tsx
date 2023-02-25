
import { Switch, Typography, useTheme } from '@suid/material';
import Box from '@suid/material/Box';
import BoxProps from '@suid/material/Box/BoxProps';
import Stack from '@suid/material/Stack';
import { ScrollView } from '~/public/components/ScrollView';
import { editor } from 'monaco-editor';
import { createEffect, createMemo, createSignal, JSX } from 'solid-js';

export interface CodeViewProps {
    sx?: BoxProps;
    text: string;
    theme: string;
    language: 'css' | 'html' | 'json' | 'typescript' | 'plaintext';
}

export const CodeView = (props: CodeViewProps) => {
    const [pre, setPre] = createSignal<HTMLPreElement | null>(null);
    const [ligature, setLigature] = createSignal<boolean>(false);
    
    createEffect(() => {
        const el = pre();
        if (el !== null) {
            el.innerHTML = props.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            editor.colorizeElement(el, {
                tabSize: 4,
            });
        }
    })

    return (
        <Box
            sx={props.sx}>
            <Stack
                sx={{
                    maxHeight: '50vh',
                }}
                direction="column"
                spacing={1}>
                
                <Stack
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    direction="row" >

                    <Typography
                        sx={{
                            flexGrow: 1,
                        }}
                        variant="body2">
                            Ligature
                    </Typography>

                    <Switch
                        onChange={(e, checked) => {
                            setLigature(checked);
                        }}
                        checked={ligature()}
                    />
                </Stack>
                <ScrollView
                    showScrollbar={true}>
                    <pre
                        style={{
                            'font-family': `'JetBrains Mono', Consolas, 'Noto Sans KR'`,
                            'font-variant-ligatures': ligature() ? 'common-ligatures' : 'none',
                            'user-select': 'text',
                        }}
                        data-lang={`text/${props.language}`}
                        ref={setPre} />
                </ScrollView>
            </Stack>
        </Box>
    );
};
