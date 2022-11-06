import { useTheme } from '@suid/material';
import Box from '@suid/material/Box';
import { createEffect, createMemo, createSignal, JSX } from 'solid-js';

export interface ScrollViewProps {
    children: JSX.Element;
    /**
     * @default 10
     */
    width?: number;
    /**
     * @default 10
     */
    minThumbHeightRatio?: number;

}

export const ScrollView = (props: ScrollViewProps) => {
    const theme = useTheme();

    const [view, setView] = createSignal<HTMLDivElement | null>(null);
    const [content, setContent] = createSignal<HTMLDivElement | null>(null);

    const [viewHeight, setViewHeight] = createSignal(0);
    const [contentHeight, setContentHeight] = createSignal(0);
    const [padding, setPadding] = createSignal(5);
    const [scroll, setScroll] = createSignal(0);
    const width = createMemo(() => props.width ?? 10);
    const minThumbHeightRatio = createMemo(() => props.minThumbHeightRatio ?? 10);

    const scrollBarHeight = createMemo(() => viewHeight() - padding() * 2);
    const thumbHeight = createMemo(() => viewHeight() / contentHeight() * scrollBarHeight());

    createEffect(() => {
        console.log(view());
        console.log(content());
        console.log(viewHeight(), contentHeight());

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
            sx={{
                width: '100%',
                height: '100%',
                overflowY: 'scroll',
                '&::-webkit-scrollbar': {
                    display: 'none'
                }
            }}
            onScroll={e => {
                console.log('s', scroll());
                console.log('c', contentHeight());
                console.log('b', scrollBarHeight());
                setScroll(view()?.scrollTop ?? 0);
            }}
            ref={setView}>
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
                        width: width(),
                        height: scrollBarHeight(),
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: width() / 2,
                        overflow: 'hidden'
                    }}>
                    <Box
                        sx={{
                            width: width(),
                            height: `${thumbHeight()}px`,
                            background: theme.palette.primary.main,
                            borderRadius: width() / 2,
                            marginTop: `${scroll() / contentHeight() * scrollBarHeight()}px`,
                            transition: 'height 0.2s linear, margin-top 0.1s linear'
                        }} />
                </Box>
            </Box>
        </Box >
    );
};
