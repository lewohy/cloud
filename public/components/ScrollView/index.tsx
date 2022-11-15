import { useTheme } from '@suid/material';
import Box from '@suid/material/Box';
import Stack from '@suid/material/Stack';
import { createEffect, createMemo, createSignal, JSX } from 'solid-js';

export interface ScrollViewProps {
    children: JSX.Element;
    /**
     * @default 8
     */
    width?: number;
    /**
     * @default 4
     */
    padding?: number;

}

// TODO: 스크롤바의 최소 크기 설정하기
export const ScrollView = (props: ScrollViewProps) => {
    const theme = useTheme();

    const [view, setView] = createSignal<HTMLDivElement | null>(null);
    const [content, setContent] = createSignal<HTMLDivElement | null>(null);

    const padding = createMemo(() => props.padding ?? 4);
    const width = createMemo(() => props.width ?? 8);

    return (
        <Stack
            ref={setView}
            sx={{
                width: '100%',
                height: '100%',
                overflowY: 'scroll',
                '&::-webkit-scrollbar': {
                    width: `auto`,
                    overflow: 'visible'
                },
                '&::-webkit-scrollbar-button': {
                    width: '0px',
                    height: '0px',
                },
                '&::-webkit-scrollbar-thumb': {
                    width: `${width()}px`,
                    background: theme.palette.primary.light,
                    backgroundClip: 'padding-box',
                    borderRadius: `${width()}px`,
                    border: `${padding()}px solid transparent`,
                    boxSizing: 'content-box'
                },
                '&::-webkit-scrollbar-thumb:active': {
                    width: `${width()}px`,
                    background: theme.palette.primary.dark,
                    backgroundClip: 'padding-box',
                    borderRadius: `${width()}px`,
                    border: `${padding()}px solid transparent`,
                    boxSizing: 'content-box'
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                    borderRadius: `${width() / 2}px`,
                    margin: `${padding()}px`,
                }
            }}>
            <Stack
                sx={{
                    width: '100%',
                    minHeight: '100%',
                }}
                ref={setContent}>
                {
                    props.children
                }
            </Stack>
        </Stack >
    );
};
