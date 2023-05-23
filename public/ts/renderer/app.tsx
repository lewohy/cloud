import { ThemeProvider, createTheme, useMediaQuery } from '@suid/material';
import { createEffect, createMemo } from 'solid-js';
import { render } from 'solid-js/web';
import { RootRouter } from '~/public/routers/RootRouter';
import '~/public/scss/base.scss';
import { SmulogContainer } from '~/public/smulog/smulog';
import { palette } from '~/public/ts/theme/palette';

const App = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = createMemo(() => createTheme(palette.getTheme(prefersDarkMode())));
    
    createEffect(() => {
        console.log('prefersDarkMode: ', prefersDarkMode());
    });

    return (
        <ThemeProvider
            theme={theme()}>
            <SmulogContainer>
                <RootRouter />
            </SmulogContainer>
        </ThemeProvider>
    );
};

render(() => {
    return <App/>;
}, document.getElementById('root') as HTMLElement);
