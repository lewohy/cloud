import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import Upload from "@suid/icons-material/Upload"
import { CreateNewFolder, CreateNewFolderOutlined, NoteAdd, NoteAddOutlined } from '@suid/icons-material';

export interface FunctionBarProps {
    onUploadClick: () => void;
    onCreateFolderClick: () => void;
    onCreateFileClick: () => void;

}

export const FunctionBar = (props: FunctionBarProps) => {
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
                <Upload/>
            </Button>
            <Button
                onClick={e => {
                    props.onCreateFileClick?.();
                }}>
                <Stack
                    direction="row"
                    spacing={1}>
                    <CreateNewFolder/>
                </Stack>
            </Button>
            <Button
                onClick={e => {
                    props.onCreateFolderClick?.();
                }}>
                <Stack
                    direction="row"
                    spacing={1}>
                    <NoteAdd/>
                </Stack>
            </Button>
        </Stack>
    );
};
