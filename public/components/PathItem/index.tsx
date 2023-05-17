import { useTheme } from '@suid/material';
import Link from '@suid/material/Link';
import Typography from '@suid/material/Typography';
import { RippleBase, RippleBaseProps } from '~/public/components/RippleBase';

export interface PathItemProps extends RippleBaseProps {
    text: string;
}

export const PathItem = (props: PathItemProps) => {
    const theme = useTheme();
    
    return (
        <RippleBase
            sx={{
                padding: '4px',
                borderRadius: '4px'
            }}
            onClick={props.onClick}>
            <Link
                underline="none"
                color={theme.palette.text.primary} >
                <Typography
                    sx={{
                        display: 'inline-block',
                    }}
                    variant='subtitle1'>
                    {decodeURIComponent(props.text)}
                </Typography>
            </Link>
        </RippleBase>
    );
};
