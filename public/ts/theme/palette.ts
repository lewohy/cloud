import { Breakpoint } from '@suid/material';
import { blue, grey } from '@suid/material/colors';
import { ThemeInput } from '@suid/material/styles/createTheme';

export const palette = {
    getTheme: (dark: boolean): Partial<ThemeInput<Breakpoint>> =>  {
        return {
            palette: {
                mode: dark ? 'dark' : 'light',
                ...(dark ? {
                    primary: {
                        main: blue['400']
                    },
                } : {
                    background: {
                        default: '#ffffff',
                    },
                    primary: {
                        main: grey['500']
                    },
                    secondary: {
                        main: '#f1f1f1'
                    }
                }) 
            },
            typography: {
                fontFamily: `'Noto Sans KR', sans-serif`
            }
        };
    },
};