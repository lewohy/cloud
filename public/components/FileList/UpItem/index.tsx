import { Folder } from '@suid/icons-material';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { JSX } from 'solid-js';
import { RippleBase } from '~/public/components/RippleBase';

export interface UpItemProps {
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

export const UpItem = (props: UpItemProps) => {

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
                        fontSize: '48px'
                    }} />

                <Stack
                    spacing="8px"
                    alignContent="start"
                    direction="column">
                    <Typography
                        sx={{
                            display: 'flex'
                        }}
                        variant="h6">
                        ..
                    </Typography>

                    <Typography
                        sx={{
                            display: 'flex'
                        }}
                        variant="subtitle2">
                        To up directory
                    </Typography>
                </Stack>
            </Stack>
        </RippleBase>
    );
};
