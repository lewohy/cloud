import { useParams, useNavigate } from '@solidjs/router'
import Breadcrumbs from '@suid/material/Breadcrumbs';
import Container from '@suid/material/Container';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { PathItem } from '~/public/components/PathItem';
import { createEffect, createMemo, For } from 'solid-js';
import { FileList } from '~/public/components/FileList';
import { ScrollView } from '~/public/components/ScrollView';
import { SmulogContainer, useDialogContainer as useSmulogContainer } from '~/public/smulog/smulog';
import { getPathString } from '~/public/ts/location';
import previewDialog from '~/public/smulog/PreviewDialog';
import mime from 'mime';
import storage from '~/public/ts/request/storage';
import promptDialog from '~/public/smulog/PromptDialog';

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
                                href={`/storage/${location().scope}`}
                                text={location().scope} />
                            <For each={location().path}>
                                {(item: string, index: () => number) => (
                                    <PathItem
                                        href={`/storage/${location().scope}/${location().path.slice(0, index() + 1).join('/')}`}
                                        text={item} />
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
                            if (item.type === 'directory') {
                                navigate(`/storage/${location().scope}/${[...location().path, item.name].join('/')}`);
                            } else {
                                const downloadUrl = `/storage/${location().scope}/${location().path.concat(item.name).join('/')}`;
                                
                                const responnse = await previewDialog.show(smulogContainer,{
                                    title: 'Preview',
                                    cancelOnTouchOutside: true,
                                }, {
                                    mimeType: mime.getType(item.name),
                                    downloadUrl
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
