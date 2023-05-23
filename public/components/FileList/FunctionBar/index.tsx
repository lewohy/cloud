import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import Upload from "@suid/icons-material/Upload"
import { CreateNewFolder, CreateNewFolderOutlined, NoteAdd, NoteAddOutlined } from '@suid/icons-material';
import { useTheme } from '@suid/material';

export interface FunctionBarProps {
    onUploadClick: () => void;
    onCreateFolderClick: () => void;
    onCreateFileClick: () => void;

}

export const FunctionBar = (props: FunctionBarProps) => {
    const theme = useTheme();

    return (
        <Stack
            sx={{

            }}
            justifyContent="flex-end"
            direction="row">
            
            <Button
                onClick={e => {
                    props.onUploadClick?.();
                }}>
                <Upload
                    sx={{
                        color: theme.palette.text.secondary
                    }}/>
            </Button>
            <Button
                onClick={e => {
                    props.onCreateFileClick?.();
                }}>
                <Stack
                    direction="row"
                    spacing={1}>
                    <CreateNewFolder
                        sx={{
                            color: theme.palette.text.secondary
                        }}/>
                </Stack>
            </Button>
            <Button
                onClick={e => {
                    props.onCreateFolderClick?.();
                }}>
                <Stack
                    direction="row"
                    spacing={1}>
                    <NoteAdd
                        sx={{
                            color: theme.palette.text.secondary
                        }}/>
                </Stack>
            </Button>
        </Stack>
    );
};
