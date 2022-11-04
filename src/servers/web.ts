import * as core from 'express-serve-static-core';
import path from 'path';
import fs from 'fs';
import logger from '~/src/logger';

export default function startWebServer(app: core.Express) {
    // NOTE: 웹 서버 또는 파일 서버
    app.get(/\/storage\/([^\/]+)(\/(.*))?/, (req, res) => {
        
        res.status(200).set({
            'Content-Type': 'text/html'
        }).end(fs.readFileSync(path.resolve(process.cwd(), './public/storage.html'), 'utf-8'));
    });

    logger.info('Web server started.');
}