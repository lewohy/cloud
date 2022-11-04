import config from '~/config.json';
import fs from 'fs';
import path from 'path';
import * as vite from 'vite';
import express from 'express';
import fileUpload from 'express-fileupload';
import nocache from 'nocache';
import startWebServer from './servers/web';
import startAPIServer from './servers/api';
import startWebSocketServer from './servers/ws';
import startUploadServer from './servers/upload';

async function createServer() {
    const app = express();
    const viteServer = await vite.createServer();

    // TODO: 이거 수정
    app.use(async (req, res, next) => {
        if (req.path.startsWith('/storage') || req.path.startsWith('/api') || req.path.startsWith('/upload')) {
            next();
        } else {
            return viteServer.middlewares(req, res, next);
        }
    });
    
    app.use(nocache());
    app.use('/api', express.json());
    app.set('etag', false);

    startUploadServer(app);
    startAPIServer(app);
    startWebServer(app);
    startWebSocketServer(app);
}

createServer();
