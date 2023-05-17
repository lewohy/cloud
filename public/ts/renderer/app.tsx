import { ThemeProvider, createTheme, useMediaQuery } from '@suid/material';
import { createMemo } from 'solid-js';
import { render } from 'solid-js/web';
import { RootRouter } from '~/public/routers/RootRouter';
import '~/public/scss/base.scss';
import { SmulogContainer } from '~/public/smulog/smulog';
import { palette } from '~/public/ts/theme/palette';

render(() => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = createMemo(() => createTheme(palette.getTheme(prefersDarkMode())));

    return (
        <ThemeProvider
            theme={theme()}>
            <SmulogContainer>
                <RootRouter />
            </SmulogContainer>
        </ThemeProvider>
    )
}, document.getElementById('root') as HTMLElement);
