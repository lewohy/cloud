import { Routes, Route } from '@solidjs/router';
import { SmulogContainer } from '~/public/smulog/smulog';
import { Storage } from '~/public/pages/Storage';
import { createTheme, ThemeProvider } from '@suid/material';
import { blue, grey } from '@suid/material/colors';


const theme = createTheme({
    palette: {
        background: {
            paper: '#ffffff'
        },
        primary: {
            main: grey['500']
        },
        secondary: {
            main: blue['400']
        }
    },
    typography: {
        fontFamily: `'Noto Sans KR', sans-serif`
    }
});

export const StorageRouter = () => {

    return (
        <ThemeProvider
            theme={theme}>
            <SmulogContainer>
                <Routes>
                    <Route path="/storage/:scope/*path" element={<Storage />} />
                </Routes>
            </SmulogContainer>
        </ThemeProvider>
    );
};
