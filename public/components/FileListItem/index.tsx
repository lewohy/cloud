import FolderOutlined from '@suid/icons-material/FolderOutlined';
import { useTheme } from '@suid/material';
import ButtonBase from '@suid/material/ButtonBase';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { RippleBase } from '~/public/components/RippleBase';

export interface FileListItemProps {
    entity: cloud.Entity;
}

export const FileListItem = (props: FileListItemProps) => {
    
    return (
        <RippleBase
            sx={{
                width: '100%',
                height: 'auto',
                padding: '24px',
                cursor: 'pointer'
            }}>
            <Stack
                sx={{
                    width: '100%',
                    height: 'auto'
                }}
                spacing="24px"
                alignItems="center"
                direction="row">

                <FolderOutlined
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
                        {props.entity.name}
                    </Typography>

                    <Typography
                        sx={{
                            display: 'flex'
                        }}
                        variant="subtitle1">
                        {props.entity.createdTime}
                    </Typography>
                </Stack>
            </Stack>
        </RippleBase>
    );
};
