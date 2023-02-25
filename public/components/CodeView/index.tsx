
import { useTheme } from '@suid/material';
import Box from '@suid/material/Box';
import BoxProps from '@suid/material/Box/BoxProps';
import Stack from '@suid/material/Stack';
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
    
    createEffect(() => {
        const el = pre();
        if (el !== null) {
            el.innerHTML = props.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            editor.colorizeElement(el, {
                mimeType: `text/${props.language}}`,
                tabSize: 4,
            });
        }
    })

    return (
        <Box
            sx={props.sx}>
            <pre
                style={{
                    'font-family': `'JetBrains Mono', Consolas, monospace`,
                    'user-select': 'text',
                }}
                data-lang="typescript"
                ref={setPre} />
        </Box>
    );
};
