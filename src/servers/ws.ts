import config from '~/config.json';
import * as core from 'express-serve-static-core';
import logger from '~/src/logger';

export default function startWebSocketServer(app: core.Express) {
    const server = app.listen(config.port, () => {
        logger.info(`WebSocket server is listening on port ${config.port}`);
    });
}