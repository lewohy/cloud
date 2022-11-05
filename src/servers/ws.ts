import config from '~/config.json';
import * as core from 'express-serve-static-core';
import logger from '~/src/logger';
import http from 'http';
import { Server } from 'socket.io';

export default function startWebSocketServer(server: http.Server) {
    const io = new Server(server, {
        path: '/socket.io'
    });

    io.on('connection', socket => {
        logger.info(`Client connected. ${socket.id}`);

        socket.on('disconnect', () => {
            logger.info(`Client disconnected.`);
        });
    });

    logger.info('WebSocket server ready.');
}