import config from '~/config.json';
import * as vite from 'vite';
import express from 'express';
import nocache from 'nocache';
import startWebServer from './servers/web';
import startAPIServer from './servers/api';
import startWebSocketServer from './servers/ws';
import startUploadServer from './servers/upload';
import logger from '~/src/logger';
import http from 'http';
import { init } from './core';

async function createServer() {
    const app = express();
    const server = http.createServer(app);
    const viteServer = await vite.createServer({
        configFile: './vite.config.ts'
    });

    // TODO: 이거 수정
    app.use(async (req, res, next) => {
        if (req.path.startsWith('/scope') || req.path.startsWith('/storage') || req.path.startsWith('/share') || req.path.startsWith('/api') || req.path.startsWith('/upload')) {
            next();
        } else {
            return viteServer.middlewares(req, res, next);
        }
    });
    
    app.use(nocache());
    app.use('/api', express.json());
    app.set('etag', false);

    init();

    startUploadServer(app);
    startAPIServer(app);
    startWebServer(app);
    startWebSocketServer(server);
    
    server.listen(config.port, () => {
        logger.info(`Server is listening on port ${config.port}`);
    });
}

createServer();
