import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import Add from "@suid/icons-material/Add"
import InsertDriveFile from "@suid/icons-material/InsertDriveFile"
import Upload from "@suid/icons-material/Upload"
import Folder from '@suid/icons-material/Folder';

export interface FunctionBarProps {

}

export const FunctionBar = (props: FunctionBarProps) => {
    return (
        <Stack
            sx={{

            }}
            justifyContent="flex-end"
            direction="row">
            
            <Button>
                <Upload/>
            </Button>
            <Button>
                <Stack
                    direction="row"
                    spacing={1}>
                    <Add/>
                    <InsertDriveFile/>
                </Stack>
            </Button>
            <Button>
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
