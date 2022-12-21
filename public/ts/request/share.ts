import axios, { AxiosResponse } from 'axios';

// TODO: 이름바꾸기
const share = {
    async post(path: string, request: cloud.protocol.share.PostRequest): Promise<cloud.protocol.share.PostResponse> {
        const response = await axios.post<
            cloud.protocol.share.PostResponse,
            AxiosResponse<cloud.protocol.share.PostResponse>,
            cloud.protocol.share.PostRequest>(`/api/share/${path}`, request);

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Failed to post. status: ${response.status}, message: ${response.data?.error?.message}`);
        }
    }
}

export default share;