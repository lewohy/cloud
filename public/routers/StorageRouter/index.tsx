import { Route, Router, Routes } from '@solidjs/router';
import { Storage } from '~/public/pages/Storage';

export const StorageRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:scope/*path" element={<Storage />} />
            </Routes>
        </Router>
    );
};
