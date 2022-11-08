import axios, { AxiosResponse } from 'axios';

function getFileFromFileEntry(fileEntry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
        fileEntry.file(resolve, reject);
    });
}

// TODO: 이름바꾸기
const cr = {
    async get(url: string): Promise<cloud.protocol.storage.GetResponse> {
        const response = await axios.get<
            cloud.protocol.storage.GetResponse,
            AxiosResponse<cloud.protocol.storage.GetResponse>,
            cloud.protocol.storage.GetRequest>(url);

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Failed to get. status: ${response.status}, message: ${response.data?.error?.message}`);
        }
    },
    async post(url: string, request: cloud.protocol.storage.PostRequest): Promise<cloud.protocol.storage.PostResponse> {
        const response = await axios.post<
            cloud.protocol.storage.PostResponse,
            AxiosResponse<cloud.protocol.storage.PostResponse>,
            cloud.protocol.storage.PostRequest>(url, request);

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Failed to post. status: ${response.status}, message: ${response.data?.error?.message}`);
        }
    },
    async upload(url: string, fileEntry: FileSystemFileEntry): Promise<cloud.protocol.storage.UploadResponse> {
        const response = await axios.post<
            cloud.protocol.storage.UploadResponse,
            AxiosResponse<cloud.protocol.storage.UploadResponse>,
            cloud.protocol.storage.UploadRequest>(url, await getFileFromFileEntry(fileEntry), {
                headers: {
                    'filename': encodeURI(fileEntry.name),
                }
            });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Failed to upload file. status: ${response.status}, message: ${response.data?.error?.message}`);
        }

    },
    // TODO: 함수 위치 바꾸기
    getPathString(location: cloud.Location): string {
        return [location.scope, ...location.path].join('/');
    }
}

export default cr;