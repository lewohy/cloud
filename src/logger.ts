import winston from 'winston';
import * as core from 'express-serve-static-core';

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple(), winston.format.errors({ stack: true })),
        })
    ]
});

// REVIEW: 함수 위치 바꿔야할듯
export function sendError<T extends cloud.protocol.storage.Response>(res: core.Response<T>, e: unknown): void {
    logger.error(e);

    if (e instanceof Error) {
        res.status(500).send({
            error: {
                message: e.message,
            }
        } as T);
    } else {
        res.status(500).send({
            error: {
                message: 'unknown error'
            }
        } as T);
    }
}

export default logger;