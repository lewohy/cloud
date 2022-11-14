import * as core from 'express-serve-static-core';
import { getLocation, createNormalDirectory, createPendingFile, deleteFile, renameFile, createNormalFile } from '~/src/core';
import logger, { sendError } from '~/src/logger';
import { isString } from '~/src/typguard';
import { sleep } from '../test';
import { getMeta } from '~/src/meta';

export default function startAPIServer(app: core.Express) {
    // NOTE: storage api 서버
    app.get<{}, cloud.protocol.storage.GetResponse, cloud.protocol.storage.GetRequest>(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);

        try {
            const meta = getMeta(location);

            res.status(200).send({
                items: meta.items
            });

        } catch (e) {
            sendError(res, e);
        }
    });

    app.post<{}, cloud.protocol.storage.PostResponse, cloud.protocol.storage.PostRequest>(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);
        const request = req.body as cloud.protocol.storage.PostRequest;
        const entity = request.entity;

        try {
            if (entity.type === 'directory') {
                if (entity.state === 'normal') {
                    await createNormalDirectory(location, entity);
                }

                res.status(200).send();
            } else if (entity.type === 'file') {
                if (entity.state === 'pending') {
                    await createPendingFile(location, entity);
                } else if (entity.state === 'normal') {
                    await createNormalFile(location, entity);
                }

                res.status(200).send();
            }
        } catch (e) {
            sendError(res, e);
        }
    });

    app.put<{}, cloud.protocol.storage.PutResponse, cloud.protocol.storage.PutRequest>(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);
        const request = req.body as cloud.protocol.storage.PutRequest;
        const entity = request.entity;

        try {
            // TODO: 테스트하기
            await renameFile(location, entity, request.newFilename);
            res.status(200).send();
        } catch (e) {
            sendError(res, e);
        }
    });

    app.delete<{}, cloud.protocol.storage.DeleteResponse, cloud.protocol.storage.DeleteRequest>(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);
        const request = req.body as cloud.protocol.storage.DeleteRequest;
        const filename = req.headers['filename'];

        try {
            // TODO: 테스트하기
            if (!isString(filename)) {
                throw new Error(`Invalid request. filename: ${filename}`);
            }

            await deleteFile(location, filename);
            res.status(200).send();
        } catch (e) {
            sendError(res, e);
        }
    });

    logger.info('API server ready.');
}