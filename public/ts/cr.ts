import axios, { AxiosResponse } from 'axios';

// TODO: 이름바꾸기
const cr = {
    async get (url: string): Promise<cloud.protocol.storage.GetResponse> {
        const response = await axios.get<
            cloud.protocol.storage.GetResponse,
            AxiosResponse<cloud.protocol.storage.GetResponse>,
            cloud.protocol.storage.GetRequest>(url);
        
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Failed to get data from cloud. status: ${response.status}, message: ${response.data?.error?.message}`);
        }
    },
    async post (url: string, request: cloud.protocol.storage.PostRequest): Promise<cloud.protocol.storage.PostResponse> {
        const response = await axios.post<
            cloud.protocol.storage.PostResponse,
            AxiosResponse<cloud.protocol.storage.PostResponse>,
            cloud.protocol.storage.PostRequest>(url, request);

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Failed to get data from cloud. status: ${response.status}, message: ${response.data?.error?.message}`);
        }
    },
    // TODO: 함수 위치 바꾸기
    getPathString(location: cloud.Location): string {
        return [location.scope, ...location.path].join('/');
    }
}

export default cr;