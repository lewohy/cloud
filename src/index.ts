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
import logger from '~/src/logger';
import http from 'http';

async function createServer() {
    const app = express();
    const server = http.createServer(app);
    const viteServer = await vite.createServer({
        configFile: './vite.config.ts'
    });

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
    startWebSocketServer(server);
    
    server.listen(config.port, () => {
        logger.info(`Server is listening on port ${config.port}`);
    });
}

createServer();
