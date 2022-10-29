import * as core from 'express-serve-static-core';
import { getLocation, createDirectory, createPendingFile, modifyMeta, deleteFile, renameFile } from '../core';
import { sendError } from '~/src/logger';
import { isString } from '../typguard';

export default function startAPIServer(app: core.Express) {
    // NOTE: storage api 서버
    app.get(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);

        try {
            const meta = await modifyMeta(location, async (meta) => {
                return meta;
            });

            res.send({
                result: {
                    successed: true
                },
                items: meta.items
            } as cloud.protocol.storage.GetResponse);

        } catch (e) {
            sendError(res, e);
        }
    });

    app.post(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);
        const request = req.body as cloud.protocol.storage.PostRequest;
        const entity = request.entity;

        try {
            if (entity.type === 'directory') {
                await createDirectory(location, entity);
                res.send({
                    result: {
                        successed: true
                    }
                } as cloud.protocol.storage.PostResponse);
            } else if (entity.type === 'file') {
                if (entity.state === 'pending') {
                    await createPendingFile(location, entity);
                    res.send({
                        result: {
                            successed: true
                        }
                    } as cloud.protocol.storage.PostResponse);
                }
            }
        } catch (e) {
            sendError(res, e);
        }
    });

    app.delete(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);
        const request = req.body as cloud.protocol.storage.DeleteRequest;
        const filename = req.headers['filename'];

        try {
            // TODO: 테스트하기
            if (!isString(filename)) {
                throw new Error(`Invalid request. filename: ${filename}`);
            }
            
            await deleteFile(location, filename);
            res.send({
                result: {
                    successed: true
                }
            } as cloud.protocol.storage.DeleteResponse);
        } catch (e) {
            sendError(res, e);
        }
    });
    
    app.put(/\/api\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);
        const request = req.body as cloud.protocol.storage.PutRequest;
        const entity = request.entity;

        try {
            // TODO: 테스트하기
            await renameFile(location, entity, request.newFilename);

            res.send({
                result: {
                    successed: true
                }
            } as cloud.protocol.storage.PutResponse);
        } catch (e) {
            sendError(res, e);
        }
    });
}