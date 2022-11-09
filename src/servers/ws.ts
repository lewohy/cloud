import config from '~/config.json';
import * as core from 'express-serve-static-core';
import logger from '~/src/logger';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { isSocketQuery } from '~/src/typguard';
import { observeMeta } from '~/src/meta';
import { getPathString } from '~/src/core';

export default function startWebSocketServer(server: http.Server) {
    const io = new Server(server, {
        path: '/socket.io'
    });

    io.on('connection', socket => {
        if (isSocketQuery(socket.handshake.query)) {
            const query = socket.handshake.query;
            logger.info(`Client connected. ID: ${socket.id}, room: ${query.room}`);

            socket.join(`${query.room}`);

            socket.on('disconnect', () => {
                logger.info(`Client disconnected.`);
            });
        } else {
            logger.error('Socket query is invalid. The socket will be disconnected.');
            socket.disconnect(true);
        }
    });

    observeMeta(modification => {
        const targetRoom = getPathString(modification.location);
        // logger.info(`Sending modification to room ${targetRoom}.`);
        io.to(targetRoom).emit('refresh');
    }); 

    logger.info('WebSocket server ready.');
}