import { Routes, Route } from '@solidjs/router';
import { SmulogContainer } from '~/public/dialogs/dialog';
import { Storage } from '~/public/pages/Storage';

export const StorageRouter = () => {

    return (
        <SmulogContainer>
            <Routes>
                <Route path="/storage/:scope/*path" element={<Storage />} />
            </Routes>
        </SmulogContainer>
    );
};
