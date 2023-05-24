import * as core from 'express-serve-static-core';
import { createNormalDirectory, createNormalFile, createPendingFile, deleteItem, getBaseLocation, getLocation, renameItem } from '~/src/core';
import logger, { sendError } from '~/src/logger';
import { getMeta } from '~/src/meta';
import { isString } from '~/src/typguard';
import { createShareId, getShareIdByLocation } from '../share';

export default function startAPIServer(app: core.Express) {
    // NOTE: storage api 서버
    app.get<{}, cloud.protocol.storage.GetResponse, cloud.protocol.storage.GetRequest>(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        try {
            const location = getLocation(req);
            const meta = getMeta(location);

            res.status(200).send({
                items: meta.items
            });

        } catch (e) {
            sendError(res, e);
        }
    });
    
    app.post<{}, cloud.protocol.storage.PostResponse, cloud.protocol.storage.PostRequest>(/\/api\/storage$/, async (req, res) => {
        try {
            const request = req.body as cloud.protocol.storage.PostRequest;
            const entity = request.entity;

            if (entity.type === 'directory') {
                if (entity.state === 'normal') {
                    await createNormalDirectory({
                        scope: '',
                        path: [],
                    }, entity);
                }

                res.status(200).send();
            }
        } catch (e) {
            sendError(res, e);
        }
    });

    app.post<{}, cloud.protocol.storage.PostResponse, cloud.protocol.storage.PostRequest>(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        try {
            const location = getLocation(req);
            const request = req.body as cloud.protocol.storage.PostRequest;
            const entity = request.entity;

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
        try {

            const location = getLocation(req);
            const name = location.path[location.path.length - 1];
            const request = req.body as cloud.protocol.storage.PutRequest;

            await renameItem(getBaseLocation(location), name, request.name);
            res.status(200).send();
        } catch (e) {
            sendError(res, e);
        }
    });

    app.delete<{}, cloud.protocol.storage.DeleteResponse, cloud.protocol.storage.DeleteRequest>(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        try {
            const location = getLocation(req);
            const name = location.path[location.path.length - 1];

            if (!isString(name)) {
                throw new Error(`Invalid request. filename: ${name}`);
            }

            await deleteItem(getBaseLocation(location), name);
            res.status(200).send();
        } catch (e) {
            sendError(res, e);
        }
    });

    app.post<{}, cloud.protocol.share.PostResponse, cloud.protocol.share.PostRequest>(/\/api\/share\/([^\/]+)(\/(.*))?/, async (req, res) => {
        try {
            const location = getLocation(req);

            const shareId = await getShareIdByLocation(location) ?? await createShareId(location);

            res.status(200).send({
                shareId
            });
        } catch (e) {
            sendError(res, e);
        }
    });

    logger.info('API server ready.');
}