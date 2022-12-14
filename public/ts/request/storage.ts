import axios, { AxiosResponse } from 'axios';

interface GetRequestTask {
    url: string;
    negligible: boolean;
    resolve: (value: cloud.protocol.storage.GetResponse | PromiseLike<cloud.protocol.storage.GetResponse> | null) => void;
    reject: (reason?: any) => void;
}

const requestList = new Array<GetRequestTask>();

export function optimizeGetRequest(url: string, negligible: boolean): Promise<cloud.protocol.storage.GetResponse | null> {
    return new Promise((resolve, reject) => {
        requestList.push({
            url,
            negligible,
            resolve,
            reject
        });

        processRequest();
    });
}

async function processRequest() {
    if (requestList.length === 1) {
        while (requestList.length > 0) {
            const task = requestList[requestList.length - 1];

            const response = await axios.get<
                cloud.protocol.storage.GetResponse,
                AxiosResponse<cloud.protocol.storage.GetResponse>,
                cloud.protocol.storage.GetRequest>(task.url);

            for (let i = 0; i < requestList.length - 1; i++) {
                const task = requestList[i];
                if (!task.negligible) {
                    break;
                }
                task.resolve(null);
            }

            requestList.length = 0;

            if (response.status === 200) {
                task.resolve(response.data);
            } else {
                task.reject(new Error(`Failed to get. status: ${response.status}, message: ${response.data?.error?.message}`));
            }
        }
    }
}

const storage = {
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
    async getOptimized(url: string, negligible?: boolean): Promise<cloud.protocol.storage.GetResponse | null> {
        return await optimizeGetRequest(url, negligible ?? false);
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
    async put(url: string, request: cloud.protocol.storage.PutRequest): Promise<cloud.protocol.storage.PutResponse> {
        const response = await axios.put<
            cloud.protocol.storage.PutResponse,
            AxiosResponse<cloud.protocol.storage.PutResponse>,
            cloud.protocol.storage.PutRequest>(url, request);

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Failed to put. status: ${response.status}, message: ${response.data?.error?.message}`);
        }
    },
    async delete(url: string): Promise<cloud.protocol.storage.DeleteResponse> {
        const response = await axios.delete<
            cloud.protocol.storage.DeleteResponse,
            AxiosResponse<cloud.protocol.storage.DeleteResponse>,
            cloud.protocol.storage.DeleteRequest>(url);

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Failed to delete. status: ${response.status}, message: ${response.data?.error?.message}`);
        }
    },
    async upload(url: string, file: File): Promise<cloud.protocol.storage.UploadResponse> {
        window.onbeforeunload = () => "";
        try {
            const response = await axios.post<
                cloud.protocol.storage.UploadResponse,
                AxiosResponse<cloud.protocol.storage.UploadResponse>,
                cloud.protocol.storage.UploadRequest>(url, file, {
                    headers: {
                        'filename': encodeURI(file.name),
                    }
                });

            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`Failed to upload file. status: ${response.status}, message: ${response.data?.error?.message}`);
            }
        } finally {
            window.onbeforeunload = null;
        }
    }
};

export default storage;