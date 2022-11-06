import Box from '@suid/material/Box';
import { JSX } from 'solid-js';

export interface ScrollViewProps {
    children: JSX.Element;
}

export const ScrollView = (props: ScrollViewProps) => {
    
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflowY: 'scroll',
                '&::-webkit-scrollbar': {
                    display: 'none'
                }
            }}>
            {
                props.children
            }
            
        </Box>
    );
};
