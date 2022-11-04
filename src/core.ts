import dayjs from 'dayjs';
import * as core from 'express-serve-static-core';

import fs from 'fs';
import path from 'path';
import config from '~/config.json';
import { isFile } from './typguard';


// TODO: 이 함수의 동기화 설정이 필요함
// 절대로 이 함수의 callback은 동시에 두 번 이상 호출되어서는 안 됨
export async function modifyMeta(location: cloud.Location, callback: (meta: cloud.Meta) => Promise<cloud.Meta>): Promise<cloud.Meta> {
    const getMeta = (location: cloud.Location): cloud.Meta => {
        const absolutePath = getAbsoluteMetaPath(location);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Not found. ${[location.scope, ...location.path].join('/')}`);
        }

        return JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
    };

    return new Promise(async (resolve, reject) => {
        try {
            const meta = getMeta(location);
            const newMeta = await callback(meta);
            fs.writeFileSync(getAbsoluteMetaPath(location), JSON.stringify(newMeta, null, 4));

            resolve(newMeta);
        } catch (e) {
            reject(e);
        }
    });
}

export function getLocation(req: core.Request): cloud.Location {
    const scope = req.params[0];
    const path = req.params[1]?.split('/')?.filter((p) => p !== '') ?? [];

    return {
        scope,
        path
    };
}

export function getAbsoluteBasePath(location: cloud.Location): string {
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

export async function createDirectory(location: cloud.Location, entity: cloud.Entity): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        const absolutePath = getAbsoluteContentsPath(location);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Not found. ${[location.scope, ...location.path].join('/')}`);
        }

        if (fs.existsSync(path.resolve(absolutePath, entity.name))) {
            throw new Error(`Already exists. ${[location.scope, ...location.path, entity.name].join('/')}`);
        }

        fs.mkdirSync(path.resolve(absolutePath, entity.name, config.path.storage.contents.name), {
            recursive: true
        });

        fs.mkdirSync(path.resolve(absolutePath, entity.name, config.path.storage.temp.name), {
            recursive: true
        });

        fs.writeFileSync(path.resolve(absolutePath, entity.name, config.path.storage.meta.name), JSON.stringify({
            items: []
        } as cloud.Meta, null, 4));

        meta.items.push({
            ...entity,
            createdTime: dayjs().valueOf()
        } as cloud.Directory);

        return meta;
    });
}

export async function createPendingFile(location: cloud.Location, entity: cloud.Entity): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        const absolutePath = getAbsoluteContentsPath(location);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`No base directory found. ${[location.scope, ...location.path].join('/')}`);
        }

        const file = meta.items.find((e) => e.name === entity.name);
        if (file !== undefined) {
            if (isFile(file)) {
                file.createdTime = dayjs().valueOf();
            } else {
                throw new Error(`The entity is directory. ${[location.scope, ...location.path].join('/')}/${file.name}`);
            }
        } else {
            meta.items.push({
                ...entity,
                createdTime: dayjs().valueOf(),
                size: 0,
                uploaded: 0
            } as cloud.File);
        }

        return meta;
    });
}

export function deleteTempFile(location: cloud.Location, filename: string): void {
    const absolutePath = path.resolve(getAbsoluteTempPath(location), filename);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
}

export async function writeToTemp(location: cloud.Location, filename: string, data: Buffer): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        if (meta.items.find((e) => e.name === filename) === undefined) {
            throw new Error(`No meta found. ${[location.scope, ...location.path].join('/')}`);
        }

        const absolutePath = getAbsoluteTempPath(location);

        fs.writeFileSync(path.resolve(absolutePath, filename), data, {
            flag: 'a',
            encoding: 'binary'
        });

        const file = meta.items.find((e) => e.name === filename) as cloud.File;
        file.state = 'uploading';
        file.uploaded += data.length;

        return meta;
    });
}

export async function deleteFile(location: cloud.Location, filename: string): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        const absolutePath = getAbsoluteContentsPath(location);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`No entity found. ${[location.scope, ...location.path].join('/')}`);
        }

        const file = meta.items.find((e) => e.name === filename);
        if (file === undefined) {
            throw new Error(`No meta found. ${[location.scope, ...location.path].join('/')}/${filename}`);
        }

        fs.unlinkSync(path.resolve(absolutePath, filename));

        meta.items = meta.items.filter((e) => e.name !== filename);

        return meta;
    });
}

export async function renameFile(location: cloud.Location, entity: cloud.Entity, newFilename: string): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        const oldAbsolutePath = path.resolve(getAbsoluteContentsPath(location), entity.name);
        const newAbsolutePath = path.resolve(getAbsoluteContentsPath(location), newFilename);

        if (!fs.existsSync(oldAbsolutePath)) {
            throw new Error(`No entity found. ${location.scope}/${location.path.join('/')}/${entity.name}`);
        }

        const file = meta.items.find((e) => e.name === entity.name);
        if (file === undefined) {
            throw new Error(`No meta found. ${location.scope}/${location.path.join('/')}/${entity.name}`);
        }

        fs.renameSync(path.resolve(oldAbsolutePath), path.resolve(newAbsolutePath));

        file.name = newFilename;

        return meta;
    });
}

export async function commitFile(location: cloud.Location, filename: string): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        const absoluteTempPath = path.resolve(getAbsoluteTempPath(location), filename);
        const absoluteContentsPath = path.resolve(getAbsoluteContentsPath(location), filename);

        if (!fs.existsSync(absoluteTempPath)) {
            throw new Error(`Not found. ${location.scope}/${location.path.join('/')}`);
        }

        if (fs.statSync(absoluteTempPath).isDirectory()) {
            throw new Error(`Cannot commit file. The temp target is directory. ${location.scope}/${location.path.join('/')}`);
        }

        if (fs.existsSync(absoluteContentsPath)) {
            fs.rmSync(absoluteContentsPath);
        }

        fs.renameSync(absoluteTempPath, absoluteContentsPath);

        const file = meta.items.find((e) => e.name === filename) as cloud.File;
        file.state = 'normal';

        return meta;
    });
}