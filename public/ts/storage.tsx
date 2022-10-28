import { StorageRouter } from '~/public/routers/StorageRouter';
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import '~/public/scss/base.scss';

render(() => (
    <Router>
        <StorageRouter />
    </Router>
), document.getElementById('root') as HTMLElement);
