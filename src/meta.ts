import { Mutex } from 'async-mutex';
import fs from 'fs';
import path from 'path';
import config from '~/config.json';
import { getBaseLocation, getPathString } from './core';
import logger from './logger';

const mutex = new Mutex();

interface MetaModification {
    location: cloud.Location;
}

type MetaModificationObserver = (modification: MetaModification) => void;

const metaModificationObserverList = new Array<MetaModificationObserver>();

export function observeMeta(observer: MetaModificationObserver) {
    metaModificationObserverList.push(observer);
};

export function getMeta(location: cloud.Location): cloud.Meta {
    const absoluteMetaPath = getAbsoluteMetaPath(location);

    if (!fs.existsSync(absoluteMetaPath)) {
        logger.error(`Meta file not found: ${absoluteMetaPath}`);
        throw new Error(`Cannot not found meta file. ${getPathString(location)}`);
    }

    return JSON.parse(fs.readFileSync(absoluteMetaPath, 'utf-8'));
};

export async function modifyMeta(location: cloud.Location, callback: (meta: cloud.Meta) => Promise<cloud.Meta>): Promise<cloud.Meta> {
    return new Promise(async (resolve, reject) => {
        const release = await mutex.acquire();
        //logger.info(`lock mutex for ${getPathString(location)} while modifying meta.json`);
        try {
            const meta = getMeta(location);
            const newMeta = await callback(meta);
            fs.writeFileSync(getAbsoluteMetaPath(location), JSON.stringify(newMeta, null, 4));

            metaModificationObserverList.forEach((observer) => {
                observer({
                    location
                });
            });

            resolve(newMeta);
        } catch (e) {
            reject(e);
        } finally {
            release();
            //logger.info(`unlock mutex for ${getPathString(location)} while modifying meta.json`);
        }
    });
}

export function getItem(location: cloud.Location): cloud.Item | undefined {
    const path = [location.scope, ...location.path];

    if (path.length === 0) {
        throw new Error('Cannot get item of storage root.');
    }
    const base = getBaseLocation(location);

    return getMeta(base).items.find(item => item.name == path.slice(-1)[0]);
};

export function getAbsoluteBasePath(location: cloud.Location): string {
    const arr = [config.path.storage.name, ...(location.scope === '' ? location.path : [location.scope, ...location.path])];

    for (let i = 1; i < arr.length; i += 2) {
        arr.splice(i, 0, config.path.storage.contents.name);
    }

    return path.resolve(...arr);
}

export function getAbsoluteContentsPath(location: cloud.Location): string {
    return path.resolve(getAbsoluteBasePath(location), config.path.storage.contents.name);
}

export function getAbsoluteTempPath(location: cloud.Location): string {
    return path.resolve(getAbsoluteBasePath(location), config.path.storage.temp.name);
}

export function getAbsoluteMetaPath(location: cloud.Location): string {
    return path.resolve(getAbsoluteBasePath(location), config.path.storage.meta.name);
}
