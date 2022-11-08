import fs from 'fs';
import path from 'path';
import config from '~/config.json';
import { getPathString } from './core';

interface MetaModification {
    location: cloud.Location;
}

type MetaModificationObserver = (modification: MetaModification) => void;

const metaModificationObserverList = new Array<MetaModificationObserver>();

export function observeMeta(observer: MetaModificationObserver) {
    metaModificationObserverList.push(observer);
};

export function getMeta(location: cloud.Location): cloud.Meta {
    const absolutePath = getAbsoluteMetaPath(location);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Cannot Not found meta base folder. ${getPathString(location)}`);
    }

    return JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
};

// TODO: 이 함수의 동기화 설정이 필요함
// 절대로 이 함수의 callback은 동시에 두 번 이상 호출되어서는 안 됨
export async function modifyMeta(location: cloud.Location, callback: (meta: cloud.Meta) => Promise<cloud.Meta>): Promise<cloud.Meta> {

    return new Promise(async (resolve, reject) => {
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
        }
    });
}

function getAbsoluteBasePath(location: cloud.Location): string {
    const arr = [location.scope, ...location.path];

    for (let i = 1; i < arr.length; i += 2) {
        arr.splice(i, 0, config.path.storage.contents.name);
    }

    return path.resolve(config.path.storage.name, ...arr);
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
