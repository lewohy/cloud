import * as core from 'express-serve-static-core';
import path from 'path';
import fs from 'fs';
import logger from '~/src/logger';
import { createScope, getLocation } from '../core';
import { getAbsoluteBasePath, getAbsoluteContentsPath, getItem, getMeta } from '../meta';
import { getLocationByShareId } from '../share';
import { getScopeList } from '../scope';

export default function startWebServer(app: core.Express) {
    // NOTE: 웹 서버 또는 파일 서버
    app.get('/share/:shareId', (req, res) => {
        const shareId = req.params.shareId;
        const location = getLocationByShareId(shareId);

        if (location === null) {
            res.status(404).send('Not Found');
            return;
        } else {
            const item = getItem(location);
            if (item === undefined) {
                res.status(404).send('Not Found');
                return;
            }
            const absolutePath = getAbsoluteBasePath(location);
            res.download(absolutePath);
        }
    });

    app.get(/\/scope/, (req, res) => {
        res.status(200).set({
            'Content-Type': 'text/html'
        }).end(fs.readFileSync(path.resolve(process.cwd(), './public/scope.html'), 'utf-8'));
    });

    app.get(/\/storage\/([^\/]+)(\/(.*))?/, async (req, res) => {
        const location = getLocation(req);

        const scopeList = getScopeList();

        if (!scopeList.includes(location.scope)) {
            await createScope(location.scope);
        }

        const item = getItem(location);

        if (item === undefined) {
            res.status(404).send('Not Found');
        } else if (item.type === 'directory') {
            res.status(200).set({
                'Content-Type': 'text/html'
            }).end(fs.readFileSync(path.resolve(process.cwd(), './public/storage.html'), 'utf-8'));
        } else if (item.type === 'file') {
            const absolutePath = getAbsoluteBasePath(location);
            res.download(absolutePath);
        }
    });

    logger.info('Web server ready.');
}