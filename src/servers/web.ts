import * as core from 'express-serve-static-core';
import path from 'path';
import fs from 'fs';
import logger from '~/src/logger';
import { getLocation } from '../core';
import { getAbsoluteBasePath, getAbsoluteContentsPath, getItem, getMeta } from '../meta';

export default function startWebServer(app: core.Express) {
    // NOTE: 웹 서버 또는 파일 서버
    app.get(/\/storage\/([^\/]+)(\/(.*))?/, (req, res) => {
        const location = getLocation(req);
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