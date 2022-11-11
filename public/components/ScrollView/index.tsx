import { useTheme } from '@suid/material';
import Box from '@suid/material/Box';
import { createEffect, createMemo, createSignal, JSX } from 'solid-js';

export interface ScrollViewProps {
    children: JSX.Element;
    /**
     * @default 7
     */
    width?: number;
    /**
     * @default 8
     */
    minThumbHeightRatio?: number;

}

// TODO: 스크롤바의 최소 크기 설정하기
export const ScrollView = (props: ScrollViewProps) => {
    const theme = useTheme();

    const [view, setView] = createSignal<HTMLDivElement | null>(null);
    const [content, setContent] = createSignal<HTMLDivElement | null>(null);
    const [thumb, setThumb] = createSignal<HTMLDivElement | null>(null);

    const [viewHeight, setViewHeight] = createSignal(0);
    const [contentHeight, setContentHeight] = createSignal(0);
    const [padding, setPadding] = createSignal(5);
    const [scroll, setScroll] = createSignal(0);
    const width = createMemo(() => props.width ?? 7);

    const scrollBarHeight = createMemo(() => viewHeight() - padding() * 2);
    const thumbHeight = createMemo(() => Math.min(scrollBarHeight(), viewHeight() / contentHeight() * scrollBarHeight()));

    createEffect(() => {
        if (view() !== null) {
            new ResizeObserver(e => {
                e.forEach(entry => {
                    setViewHeight(entry.target.clientHeight);
                });
            }).observe(view()!);
        }

        if (content() !== null) {
            new ResizeObserver(e => {
                e.forEach(entry => {
                    setContentHeight(entry.target.clientHeight);
                });
            }).observe(content()!);
        }
    });

    return (
        <Box
            ref={setView}
            sx={{
                width: '100%',
                height: '100%',
                overflowY: 'scroll',
                '&::-webkit-scrollbar': {
                    display: 'none'
                }
            }}
            onScroll={e => {
                setScroll(view()?.scrollTop ?? 0);
            }}>
            <Box
                ref={setContent}>
                {
                    props.children
                }
            </Box>

            <Box
                sx={{
                    width: 'auto',
                    height: '100%',
                    padding: `${padding()}px`,
                    position: 'absolute',
                    right: '0',
                    top: '0'
                }}>
                <Box
                    sx={{
                        width: `${width()}px`,
                        height: `${scrollBarHeight()}px`,
                        background: theme.palette.primary.light,
                        borderRadius: `${width() / 2}px`,
                        overflow: 'hidden'
                    }}>
                    <Box
                        ref={setThumb}
                        sx={{
                            width: `${width()}px`,
                            height: `${thumbHeight()}px`,
                            background: theme.palette.primary.dark,
                            borderRadius: `${width() / 2}px`,
                            marginTop: `${scroll() / contentHeight() * scrollBarHeight()}px`,
                            transition: 'height 0.2s ease-in-out'
                        }} />
                </Box>
            </Box>
        </Box >
    );
};
