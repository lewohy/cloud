import dayjs from 'dayjs';
import * as core from 'express-serve-static-core';

import fs from 'fs';
import path from 'path';
import config from '~/config.json';
import logger from './logger';
import { getAbsoluteContentsPath, getAbsoluteTempPath, modifyMeta } from './meta';
import { isFile } from './typguard';

export function getLocation(req: core.Request): cloud.Location {
    const scope = req.params[0];
    const path = req.params[1]?.split('/')?.filter((p) => p !== '') ?? [];

    return {
        scope,
        path
    };
}

export function getPathString(location: cloud.Location): string {
    return [location.scope, ...location.path].join('/');
}

export async function createNormalDirectory(location: cloud.Location, entity: cloud.Entity): Promise<void> {
    const create = async (location: cloud.Location, entity: cloud.Entity): Promise<cloud.Meta> => {
        return await modifyMeta(location, async (meta) => {
            const absolutePath = getAbsoluteContentsPath(location);

            if (!fs.existsSync(absolutePath)) {
                throw new Error(`No base directory found. ${getPathString(location)}`);
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
    };

    const paths = [...location.path, entity.name];

    for (let i = 0; i < paths.length; i++) {
        logger.info(`Creating directory. ${[location.scope, ...paths.slice(0, i + 1)].join('/')}`);
        try {
            await create({
                scope: location.scope,
                path: paths.slice(0, i)
            }, {
                type: 'directory',
                name: paths[i],
                state: 'normal'
            });

            logger.info(`Directory ${[location.scope, ...paths.slice(0, i + 1)].join('/')} created.`);
        } catch (e) {
            logger.warn(`Directory already exists. ${[location.scope, ...paths.slice(0, i + 1)].join('/')}`);
        }
    }
}

export async function createPendingFile(location: cloud.Location, entity: cloud.Entity): Promise<cloud.Meta> {
    if (location.path.length > 0) {
        await createNormalDirectory({
            scope: location.scope,
            path: location.path.slice(0, -1)
        }, {
            type: 'directory',
            name: location.path[location.path.length - 1],
            state: 'normal'
        });
    }

    return await modifyMeta(location, async (meta) => {
        const absoluteContentsPath = getAbsoluteContentsPath(location);
        const absoluteTempPath = getAbsoluteTempPath(location);

        if (!fs.existsSync(absoluteContentsPath)) {
            throw new Error(`No base directory found. ${getPathString(location)}`);
        }

        logger.info(`Creating pending file. ${getPathString(location)}/${entity.name}`);

        // create file
        fs.writeFileSync(path.resolve(absoluteTempPath, entity.name), '');

        const file = meta.items.find((e) => e.name === entity.name);

        if (file !== undefined) {
            if (isFile(file)) {
                file.createdTime = dayjs().valueOf();
            } else {
                throw new Error(`The entity is directory. ${getPathString(location)}/${file.name}`);
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

export async function createNormalFile(location: cloud.Location, entity: cloud.Entity): Promise<cloud.Meta> {
    if (location.path.length > 0) {
        await createNormalDirectory({
            scope: location.scope,
            path: location.path.slice(0, -1)
        }, {
            type: 'directory',
            name: location.path[location.path.length - 1],
            state: 'normal'
        });
    }

    return await modifyMeta(location, async (meta) => {
        const absolutePath = getAbsoluteContentsPath(location);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`No base directory found. ${getPathString(location)}`);
        }

        if (fs.existsSync(path.resolve(absolutePath, entity.name))) {
            throw new Error(`Already exists. ${[location.scope, ...location.path, entity.name].join('/')}`);
        }

        // create file
        fs.writeFileSync(path.resolve(absolutePath, entity.name), '');

        meta.items.push({
            ...entity,
            createdTime: dayjs().valueOf(),
            size: 0,
            uploaded: 0
        } as cloud.File);

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
            throw new Error(`No meta found. ${getPathString(location)}`);
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
            throw new Error(`No entity found. ${getPathString(location)}`);
        }

        const file = meta.items.find((e) => e.name === filename);
        if (file === undefined) {
            throw new Error(`No meta found. ${getPathString(location)}/${filename}`);
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

        logger.info(`Commit file. ${absoluteTempPath} -> ${absoluteContentsPath}`);

        if (!fs.existsSync(absoluteTempPath)) {
            throw new Error(`Not found temp path. ${location.scope}/${location.path.join('/')}`);
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