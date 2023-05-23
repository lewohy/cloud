import winston from 'winston';
import * as core from 'express-serve-static-core';
import config from '~/config.json';
import { isError } from './typguard';
import path from 'path';
import dayjs from 'dayjs';

const logFilePath = path.resolve(config.log.base, dayjs().format(config.log.debug));

const logger = {
    info: (message: string) => {
        const stack = new Error().stack?.split('\n').slice(2).map((e) => e.trim());

        winstonLogger.info(message, {
            stack
        });
    },
    error: (e: any) => {
        const stack = new Error().stack?.split('\n').slice(2).map((e) => e.trim());

        winstonLogger.error(e, {
            stack
        });
    },
    warn: (message: string) => {
        const stack = new Error().stack?.split('\n').slice(2).map((e) => e.trim());

        winstonLogger.warn(message, {
            stack
        });
    }
}

const winstonLogger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({
                    level: true
                }),
                winston.format.printf(info => {
                    return `[${info.timestamp}] [${info.level}]: ${info.message}`;
                })
            )
        }),
        new winston.transports.File({
            filename: logFilePath,
            format: winston.format.combine(
                winston.format.printf(info => {
                    return `[${info.timestamp}] [${info.level}]: ${info.message}` + (info.stack ? '\n' + info.stack.map((e: string) => `\t${e}`).join('\n') : '');
                })
            )
        }),
    ],
    format: winston.format.combine(
        winston.format.errors({
            stack: false
        }),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
    )
});

// REVIEW: 함수 위치 바꿔야할듯
export function sendError<T extends cloud.protocol.storage.Response>(res: core.Response<T>, e: unknown): void {
    if (isError(e)) {
        logger.error(e);

        res.status(204).send({
            error: {
                message: e.message
            }
        } as T);
    } else {
        const error = new Error(`Unknown error.\n${JSON.stringify(e, null, 4)}`);
        logger.error(error);

        res.status(204).send({
            error: {
                message: 'unknown error'
            }
        } as T);
    }
}

export default logger;