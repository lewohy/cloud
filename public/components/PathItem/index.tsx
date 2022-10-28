import { useTheme } from '@suid/material';
import ButtonBase from '@suid/material/ButtonBase';
import Link from '@suid/material/Link';
import Typography from '@suid/material/Typography';
import { RippleBase } from '~/public/components/RippleBase';

export interface PathItemProps {
    href: string;
    text: string;
}

export const PathItem = (props: PathItemProps) => {
    const theme = useTheme();
    
    return (
        <RippleBase
            sx={{
                padding: '4px',
                borderRadius: '4px'
            }}>
            <Link
                underline="none"
                color={theme.palette.text.primary}
                href={props.href}>
                <Typography
                    sx={{
                        display: 'inline-block',
                    }}
                    variant='subtitle1'>
                    {props.text}
                </Typography>
            </Link>
        </RippleBase>
    );
};
