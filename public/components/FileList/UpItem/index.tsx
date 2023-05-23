import { Folder } from '@suid/icons-material';
import { useTheme } from '@suid/material';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { JSX } from 'solid-js';
import { RippleBase } from '~/public/components/RippleBase';

export interface UpItemProps {
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

export const UpItem = (props: UpItemProps) => {
    const theme = useTheme();

    return (
        <RippleBase
            sx={{
                width: '100%',
                height: 'auto',
                padding: '24px',
                cursor: 'pointer'
            }}
            onClick={props.onClick}>
            <Stack
                sx={{
                    width: '100%',
                    height: 'auto'
                }}
                spacing="24px"
                alignItems="center"
                direction="row">

                <Folder
                    sx={{
                        fontSize: '48px',
                        color: theme.palette.text.primary
                    }} />

                <Stack
                    spacing="8px"
                    alignContent="start"
                    direction="column">
                    <Typography
                        sx={{
                            display: 'flex',
                            color: theme.palette.text.primary
                        }}
                        variant="h6">
                        ..
                    </Typography>

                    <Typography
                        sx={{
                            display: 'flex',
                            color: theme.palette.text.secondary,
                        }}
                        variant="subtitle2">
                        To up directory
                    </Typography>
                </Stack>
            </Stack>
        </RippleBase>
    );
};
