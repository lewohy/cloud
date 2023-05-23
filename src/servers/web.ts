import * as core from 'express-serve-static-core';
import fs from 'fs';
import path from 'path';
import logger from '~/src/logger';
import { getAbsoluteBasePath, getItem } from '../meta';
import { getLocationByShareId } from '../share';
import { assert } from 'console';

export default function startWebServer(app: core.Express) {
    app.get('/', (req, res) => {
        res.redirect('/scope');
    });

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

    app.get('/scope', (req, res) => {
        res.status(200).set({
            'Content-Type': 'text/html'
        }).end(fs.readFileSync(path.resolve(process.cwd(), './public/index.html'), 'utf-8'));
    });

    app.get([
        '/storage/:scope',
        '/storage/:scope/*'
    ], (req, res) => {
        const location: cloud.Location = {
            scope: req.params.scope,
            path: (req.params[0] || '').split('/')
        };

        const item = getItem(location);

        if (item === undefined) {
            res.status(200).set({
                'Content-Type': 'text/html'
            }).end(fs.readFileSync(path.resolve(process.cwd(), './public/index.html'), 'utf-8'));
        } else {
            const absolutePath = getAbsoluteBasePath(location);
            res.download(absolutePath);
        }
    });

    logger.info('Web server ready.');
}