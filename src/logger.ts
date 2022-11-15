import winston from 'winston';
import * as core from 'express-serve-static-core';
import config from '~/config.json';
import { isError } from './typguard';

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.printf(info => {
            return `[${info.timestamp}] [${info.level}]: ${info.message}`;
        }),
        winston.format.colorize({
            all: true
        }),
    )
});

const debugLogger = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.File({
            filename: config.log.debug
        })
    ],
    format: winston.format.combine(
        winston.format.errors({
            stack: true
        }),
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint(),
    )
});

// REVIEW: 함수 위치 바꿔야할듯
export function sendError<T extends cloud.protocol.storage.Response>(res: core.Response<T>, e: unknown): void {
    if (isError(e)) {
        logger.error(e.message);
        debugLogger.error(e);

        res.status(400).send({
            error: {
                message: e.message,
            }
        } as T);
    } else {
        const error = new Error(`Unknown error.\n${JSON.stringify(e, null, 4)}`);
        logger.error(error.message);
        debugLogger.error(error);

        res.status(400).send({
            error: {
                message: 'unknown error'
            }
        } as T);
    }
}

export default logger;