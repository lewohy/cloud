import winston from 'winston';
import * as core from 'express-serve-static-core';

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        })
    ]
});

// REVIEW: 함수 위치 바꿔야할듯
export function sendError(res: core.Response, e: unknown): void {
    logger.error(e);

    if (e instanceof Error) {
        res.send({
            result: {
                successed: false,
                message: e.message
            }
        } as cloud.protocol.storage.GetStorageResponse);
    } else {
        res.send({
            result: {
                successed: false,
                message: 'unknown error'
            }
        } as cloud.protocol.storage.GetStorageResponse);
    }
}

export default logger;