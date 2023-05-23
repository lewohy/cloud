
import { Switch, Typography } from '@suid/material';
import Box from '@suid/material/Box';
import BoxProps from '@suid/material/Box/BoxProps';
import Stack from '@suid/material/Stack';
import { editor } from 'monaco-editor';
import { createEffect, createSignal } from 'solid-js';
import { ScrollView } from '~/public/components/ScrollView';

export interface CodeViewProps {
    sx?: BoxProps;
    text: string;
    language: string;
    // 'css' | 'html' | 'json' | 'typescript' | 'plain';
}

export const CodeView = (props: CodeViewProps) => {
    const [pre, setPre] = createSignal<HTMLPreElement | null>(null);
    const [ligature, setLigature] = createSignal<boolean>(false);
    
    createEffect(() => {
        const el = pre();
        if (el !== null) {
            // REVIEW: 안전한지 확인 필요
            el.innerHTML = props.text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
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
