import { Routes, Route } from '@solidjs/router';
import { Storage } from '~/public/pages/Storage';

export const StorageRouter = () => {
    
    return (
        <Routes>
            <Route path="/storage/:scope/*path" element={<Storage />} />
        </Routes>
    );
};
