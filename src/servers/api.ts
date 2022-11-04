import * as core from 'express-serve-static-core';
import { getLocation, createDirectory, createPendingFile, modifyMeta, deleteFile, renameFile } from '../core';
import { sendError } from '~/src/logger';
import { isString } from '../typguard';
import { sleep } from '../test';

export default function startAPIServer(app: core.Express) {
    // NOTE: storage api 서버
    app.get<{}, cloud.protocol.storage.GetResponse, cloud.protocol.storage.GetRequest>(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);

        try {
            const meta = await modifyMeta(location, async (meta) => {
                return meta;
            });

            

            res.status(200).send({
                items: meta.items,
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
                await createDirectory(location, entity);
                res.status(200).send();
            } else if (entity.type === 'file') {
                await createPendingFile(location, entity);
                res.status(200).send();
            }
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
}