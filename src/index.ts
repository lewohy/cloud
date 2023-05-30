import express from 'express';
import http from 'http';
import nocache from 'nocache';
import path from 'path';
import * as vite from 'vite';
import config from '~/config.json';
import logger from '~/src/logger';
import { init } from './core';
import startAPIServer from './servers/api';
import startUploadServer from './servers/upload';
import startWebServer from './servers/web';
import startWebSocketServer from './servers/ws';
import { networkInterfaces } from 'os';

async function createServer() {
    const app = express();
    const server = http.createServer(app);
    const viteServer = await vite.createServer({
        configFile: './vite.config.ts',
        server: {
            watch: {
                ignored: [
                    path.resolve(process.cwd(), config.path.storage.name),
                ]
            }
        }
    });

    // TODO: 이거 수정
    app.use(async (req, res, next) => {
        if (req.path === '/' ||
            req.path.startsWith('/scope') ||
            req.path.startsWith('/storage') ||
            req.path.startsWith('/share') ||
            req.path.startsWith('/api') ||
            req.path.startsWith('/upload')) {
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
        logger.info(`Server is listening on http://127.0.0.1:${config.port}`);
        getLocalIPList().forEach(ip => {
            logger.info(`Server is listening on http://${ip}:${config.port}`);
        });
    });
}

function getLocalIPList(): string[] {
    const interfaces = networkInterfaces();
    const ipList: string[] = [];
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name] ?? []) {
            if (net.family === 'IPv4' && !net.internal) {
                ipList.push(net.address);
            }
        }
    }
    return ipList;
}

createServer();