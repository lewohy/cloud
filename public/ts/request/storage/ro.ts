// Get request Optimizer

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