import { useNavigate, useParams } from '@solidjs/router';
import Breadcrumbs from '@suid/material/Breadcrumbs';
import Container from '@suid/material/Container';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { For, createEffect, createMemo } from 'solid-js';
import { isDirectory } from '~/public/ts/typeguard';
import { FileList } from '~/public/components/FileList';
import { PathItem } from '~/public/components/PathItem';
import { ScrollView } from '~/public/components/ScrollView';
import previewDialog from '~/public/smulog/PreviewDialog';
import promptDialog from '~/public/smulog/PromptDialog';
import { useDialogContainer as useSmulogContainer } from '~/public/smulog/smulog';
import { getDownloadUrl, getPathString } from '~/public/ts/location';
import storage from '~/public/ts/request/storage';

type StorageParams = Record<'scope' | 'path', string>;

export interface StorageProps {

}

export const Storage = (props: StorageProps) => {
    const smulogContainer = useSmulogContainer();

    const params = useParams<StorageParams>();
    const location = createMemo<cloud.Location>(() => ({
        scope: params.scope,
        path: params.path.length === 0 ? [] : params.path.split('/')
    }));
    const navigate = useNavigate();
    
    const getSelectedFileListByUser = (): Promise<File[]> => {
        return new Promise((resolve, rejet) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.addEventListener('change', e => {
                resolve(Array.from(input.files ?? []));
            });
            input.click();
        });
    };

    const createFolder = async (name: string) => {
        try {
            const result = await storage.post(`/api/storage/${getPathString(location())}`, {
                entity: {
                    type: 'directory',
                    name,
                    state: 'normal'
                }
            });
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };

    const createFile = async (name: string) => {
        try {
            const result = await storage.post(`/api/storage/${getPathString(location())}`, {
                entity: {
                    type: 'file',
                    name,
                    state: 'normal'
                }
            });
        } catch (error) {
            // TODO: 요청 실패 처리하기
            console.error(error);
        }
    };


    createEffect(() => {
        document.title = `${getPathString(location())}`;
    });

    return (
        <ScrollView>
            <Container
                maxWidth="md"
                sx={{
                    width: '100%',
                    height: 'auto',
                    minHeight: '100%',
                    display: 'flex',
                }}>
                <Stack
                    sx={{
                        width: '100%',
                        height: 'auto',
                        minHeight: '100%',
                        marginLeft: '4px',
                        marginRight: '4px',
                    }}>

                    <Stack>
                        <Typography variant='h3'>{location().scope}</Typography>

                        <Breadcrumbs
                            sx={{
                                margin: '16px 0px',
                            }}>
                            <PathItem
                                text={location().scope}
                                onClick={e => {
                                    navigate(`/storage/${location().scope}`);
                                }} />
                            <For each={location().path}>
                                {(item: string, index: () => number) => (
                                    <PathItem
                                        text={item}
                                        onClick={e => {
                                            navigate(`/storage/${location().scope}/${location().path.slice(0, index() + 1).join('/')}`);
                                        }} />
                                )}
                            </For>
                        </Breadcrumbs>
                    </Stack>
                    <FileList
                        sx={{
                            height: '100%',
                            flexGrow: 1
                        }}
                        location={location()}
                        onUpClick={() => {
                            navigate(`/storage/${location().scope}/${location().path.slice(0, -1).join('/')}`);
                        }}
                        onItemClick={async item => {
                            if (isDirectory(item)) {
                                navigate(`/storage/${location().scope}/${[...location().path, item.name].join('/')}`);
                            } else if (item.type === 'file') {
                                const downloadUrl = getDownloadUrl(location(), item);
                                
                                const responnse = await previewDialog.show(smulogContainer,{
                                    title: 'Preview',
                                    cancelOnTouchOutside: true,
                                }, {
                                    location: location(),
                                    file: item
                                });

                                if (responnse?.response === 'positive') {
                                    window.open(downloadUrl, '_blank');
                                }
                            }
                        }}
                        onUploadClick={async () => {
                            const fileList = await getSelectedFileListByUser();
                        
                            // TODO: 중복 파일 처리하기
                            fileList.forEach(async file => {
                                await storage.post(`/api/storage/${getPathString(location())}`, {
                                    entity: {
                                        type: 'file',
                                        name: file.name,
                                        state: 'pending'
                                    }
                                });

                                await storage.upload(`/upload/storage/${getPathString(location())}`, file);
                            });
                        }}
                        onCreateFolderClick={async () => {
                            
                            const result = await promptDialog.show(smulogContainer, {
                                title: 'Create Folder'
                            }, {
                                message: '폴더 이름을 입력하세요.',
                                label: 'New Folder'
                            });

                            if (result.response === 'positive') {
                                if (result.returns !== undefined) {
                                    await createFolder(result.returns.value);
                                }
                            }
                        }}
                        onCreateFileClick={async () => {
                            
                            const result = await promptDialog.show(smulogContainer, {
                                title: 'Create File'
                            }, {
                                message: '파일 이름을 입력하세요.',
                                label: 'New File'
                            });

                            if (result.response === 'positive') {
                                if (result.returns !== undefined) {
                                    await createFile(result.returns.value);
                                }
                            }
                        }} />
                </Stack>
            </Container>
        </ScrollView>
    );

};
