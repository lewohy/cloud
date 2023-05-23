import { useTheme } from '@suid/material';
import Stack from '@suid/material/Stack';
import { createMemo, createSignal, JSX } from 'solid-js';

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
    /**
     * @default true
     */
    showScrollbar?: boolean;

}

export const ScrollView = (props: ScrollViewProps) => {
    const theme = useTheme();

    const [view, setView] = createSignal<HTMLDivElement | null>(null);
    const [content, setContent] = createSignal<HTMLDivElement | null>(null);

    const width = createMemo(() => props.width ?? 8);
    const padding = createMemo(() => props.padding ?? 4);
    const showScrollbar = createMemo(() => props.showScrollbar ?? true);

    // TODO: 스크롤바 색 지정
    return (
        <Stack
            ref={setView}
            sx={{
                width: '100%',
                // height: '100%',
                paddingLeft: showScrollbar() ? `${width() + padding() * 2}px` : '0px',
                overflowY: 'scroll',
                '&::-webkit-scrollbar': {
                    width: `auto`,
                    overflow: 'visible',
                    display: showScrollbar() ? 'block' : 'none'
                },
                '&::-webkit-scrollbar-button': {
                    width: '0px',
                    height: '0px',
                },
                '&::-webkit-scrollbar-thumb': {
                    width: `${width()}px`,
                    backgroundColor: 'secondary.main',
                    backgroundClip: 'padding-box',
                    borderRadius: `${width()}px`,
                    border: `${padding()}px solid transparent`,
                    boxSizing: 'content-box'
                },
                '&::-webkit-scrollbar-thumb:active': {
                    width: `${width()}px`,
                    backgroundColor: 'primary.dark',
                    backgroundClip: 'padding-box',
                    borderRadius: `${width()}px`,
                    border: `${padding()}px solid transparent`,
                    boxSizing: 'content-box'
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                    borderRadius: `${width() / 2}px`,
                    margin: `${padding()}px`,
                },
                '&::-webkit-scrollbar-corner': {
                    backgroundColor: 'transparent'
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
