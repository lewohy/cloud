import { StorageRouter } from '~/public/routers/StorageRouter';
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import '~/public/scss/base.scss';
import { Scope } from '~/public/pages/Scope';

render(() => (
    <Scope/>
), document.getElementById('root') as HTMLElement);
