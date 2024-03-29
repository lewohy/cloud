import bodyParser from 'body-parser';
import dayjs from 'dayjs';
import * as core from 'express-serve-static-core';
import { commitFile, getLocation, getPathString, rollbackFile, writeToTemp } from '~/src/core';
import logger, { sendError } from '~/src/logger';
import { modifyMeta } from '~/src/meta';
import { isFile, isNumber, isString } from '~/src/typguard';

export default function startUploadServer(app: core.Express) {
    app.use('/upload', bodyParser.raw({
        // TODO: unlimit로 바꾸는 방법 찾기
    }));

    app.post(/\/upload\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        try {
            const location = getLocation(req);

            const size = parseInt(req.headers['content-length'] ?? '');
            const filename = (() => {
                const encoded = req.headers['filename'];
                return isString(encoded) ? decodeURI(encoded) : undefined;
            })();

            if (!isNumber(size) || !isString(filename)) {
                throw new Error(`Invalid request. size: ${size}, filename: ${filename}`);
            }

            await modifyMeta(location, async (meta) => {
                const entity = meta.items.find((e) => e.name === filename);

                if (entity === undefined) {
                    throw new Error(`Invalid access. There is no pending file. ${getPathString(location)}/${filename}`);
                }

                if (!isFile(entity)) {
                    throw new Error(`The entity is directory. ${getPathString(location)}/${entity.name}`);
                }

                if(entity.state !== 'pending') {
                    throw new Error(`The entity is not pending. ${getPathString(location)}/${entity.name}`);
                }

                entity.size = size;
                entity.uploaded = 0;
                entity.createdTime = dayjs().valueOf();

                return meta;
            });

            let current = 0;

            // NOTE: 이벤트가 순차적으로 실행되어야하는데 async면 잠재적으롬 문제있을거같음. 확인필요
            req.on('data', async (chunk: Buffer) => {
                current += chunk.length;
                // logger.info(`uploading... ${current}/${size}`);
                await writeToTemp(location, filename, chunk);
            }).on('end', async () => {
                await commitFile(location, filename);
                res.status(200).send();
            }).on('error', async (e) => {
                await rollbackFile(location, filename);
            });
        } catch (e) {
            sendError(res, e);
        }
    });

    logger.info('Upload server ready.');
}