import { Route, Router, Routes } from '@solidjs/router';
import { Scope } from '~/public/pages/Scope';
import { StorageRouter } from '~/public/routers/StorageRouter';

export const RootRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/scope" element={<Scope />} />
                <Route path="/storage/*" element={<StorageRouter />} />
            </Routes>
        </Router>
    );
};
