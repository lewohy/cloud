import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import Add from "@suid/icons-material/Add"
import InsertDriveFile from "@suid/icons-material/InsertDriveFile"
import Upload from "@suid/icons-material/Upload"
import Folder from '@suid/icons-material/Folder';

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
                    <Add/>
                    <InsertDriveFile/>
                </Stack>
            </Button>
            <Button
                onClick={e => {
                    props.onCreateFolderClick?.();
                }}>
                <Stack
                    direction="row"
                    spacing={1}>
                    <Add/>
                    <Folder/> 
                </Stack>
            </Button>
        </Stack>
    );
};
