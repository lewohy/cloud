import http from 'http';
import { Server } from 'socket.io';
import { getPathString } from '~/src/core';
import logger from '~/src/logger';
import { observeMeta } from '~/src/meta';
import { isSocketQuery } from '~/src/typguard';

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
        logger.info(`Sending modification to room ${targetRoom}.`);
        // get all socket in room
        const sockets = io.sockets.adapter.rooms.get(targetRoom);
        sockets?.forEach(socketId => {
            logger.info(`Sending modification to ${socketId}.`);
        });
        logger.info(`Sending modification to `);
        io.to(targetRoom).emit('refresh');
    }); 

    logger.info('WebSocket server ready.');
}