import { useTheme } from '@suid/material';
import ButtonBase, { ButtonBaseProps } from '@suid/material/ButtonBase';

export interface RippleBaseProps extends ButtonBaseProps {

}

export const RippleBase = (props: RippleBaseProps) => {
    const theme = useTheme();

    props.sx = {
        ...props.sx,
        background: theme.palette.background.default,
        transition: 'background 0.2s ease-in-out',
        '&:hover': {
            background: theme.palette.action.hover,
            // NOTE: sx에 &:hover가 없다고 뜸
            /** @ts-ignore */
            ...props.sx?.['&:hover']
        }
    }

    return (
        <ButtonBase
            onMouseDown={e => {
                e.stopPropagation();
            }}
            {...props }/>
    );
};
