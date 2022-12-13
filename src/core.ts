import dayjs from 'dayjs';
import * as core from 'express-serve-static-core';

import fs from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import config from '~/config.json';
import logger from './logger';
import { getAbsoluteContentsPath, getAbsoluteTempPath, modifyMeta } from './meta';
import { isFile, isString } from './typguard';

export function init() {
    const absoluteLogPath = path.resolve(config.log.base);
    const absoluteStoragePath = path.resolve(config.path.storage.name);
    const absoulutePreferencePath = path.resolve(config.path.preference.name);

    if (!fs.existsSync(absoluteLogPath)) {
        fs.mkdirSync(absoluteLogPath, {
            recursive: true
        });

        logger.info(`Created log directory: ${absoluteLogPath}`);
    }

    if (!fs.existsSync(absoluteStoragePath)) {
        fs.mkdirSync(absoluteStoragePath, {
            recursive: true
        });

        logger.info(`Created storage directory: ${absoluteStoragePath}`);

        fs.writeFileSync(path.resolve(absoluteStoragePath, config.path.storage.meta.name), JSON.stringify({
            items: [],
            backups: []
        }, null, 4));

        logger.info(`Created meta file: ${path.resolve(absoluteStoragePath, config.path.storage.meta.name)}`);
    }
    
    if (!fs.existsSync(absoulutePreferencePath)) {
        fs.mkdirSync(absoulutePreferencePath, {
            recursive: true
        });

        logger.info(`Created preference directory: ${absoulutePreferencePath}`);

        fs.writeFileSync(path.resolve(absoulutePreferencePath, config.path.preference.share.name), JSON.stringify({
            shares: []
        }, null, 4));

        logger.info(`Created share file: ${path.resolve(absoulutePreferencePath, config.path.preference.share.name)}`);
    }
}

export function getLocation(req: core.Request): cloud.Location {
    if (!isString(req.params[0]) && !isString(req.params[1])) {
        throw new Error('Invalid location');
    }
    
    const scope = req.params[0];
    const path = req.params[1]?.split('/')?.filter((p) => p !== '') ?? [];

    return {
        scope,
        path
    };
}

export function getBaseLocation(location: cloud.Location): cloud.Location {
    if (location.path.length === 0) {
        if (location.scope.length === 0) {
            throw new Error(`Cannt get base location of ${location.scope}/${location.path.join('/')}`);
        }

        return {
            scope: '', // REVIEW: .으로 바꿔야 하는건가?
            path: []
        };
    }

    return {
        scope: location.scope,
        path: location.path.slice(0, location.path.length - 1)
    };
}

export function getPathString(location: cloud.Location): string {
    return [location.scope, ...location.path].join('/');
}

export async function createScope(scope: string): Promise<void> {
   await createNormalDirectory({
        scope: '',
        path: []
    }, {
        type: 'directory',
        name: scope,
        state: 'normal'
    });
};

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
                // TODO: 기본 meta내용 생성기 만들어서 쓰기. 그리고 typeing과 동기화시키기
                items: [],
                backups: []
            } as cloud.Meta, null, 4));

            meta.items.push({
                ...entity,
                createdTime: dayjs().valueOf()
            } as cloud.Directory);

            logger.info(`Created directory. ${absolutePath}`);

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
            logger.error(`Directory already exists. ${[location.scope, ...paths.slice(0, i + 1)].join('/')}`);
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
            meta.backups.push({
                ...file
            });

            if (isFile(file)) {
                file.createdTime = dayjs().valueOf();
                file.state = 'pending';
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

        logger.info(`Pending file ${absoluteTempPath} created.`);

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

        logger.info(`Normal file ${absolutePath}/${entity.name} created.`);

        return meta;
    });
}

export function deleteTempFile(location: cloud.Location, filename: string): void {
    const absolutePath = path.resolve(getAbsoluteTempPath(location), filename);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);

        logger.info(`Deleted temp file. ${absolutePath}`);
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

export async function deleteItem(location: cloud.Location, name: string): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        const absolutePath = path.resolve(getAbsoluteContentsPath(location), name);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`No entity found. ${getPathString(location)}`);
        }

        const file = meta.items.find((e) => e.name === name);
        if (file === undefined) {
            throw new Error(`No meta found. ${getPathString(location)}/${name}`);
        }

        fs.rmSync(absolutePath, {
            recursive: true
        });

        meta.items = meta.items.filter((e) => e.name !== name);

        logger.info(`Deleted. ${getPathString(location)}/${name}`);

        return meta;
    });
}

export async function renameItem(location: cloud.Location, from: string, to: string): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        const oldAbsolutePath = path.resolve(getAbsoluteContentsPath(location), from);
        const newAbsolutePath = path.resolve(getAbsoluteContentsPath(location), to);

        const file = meta.items.find((e) => e.name === from);
        if (file === undefined) {
            throw new Error(`No meta found. ${getPathString(location)}/${from}`);
        }

        if (meta.items.findIndex((e) => e.name === to) !== -1) {
            throw new Error(`Cannot replace. ${getPathString(location)}/${to} already exists.`);
        }

        fs.renameSync(path.resolve(oldAbsolutePath), path.resolve(newAbsolutePath));

        file.name = to;

        logger.info(`Renamed. ${oldAbsolutePath} -> ${newAbsolutePath}`);

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

        logger.info(`Commit file success. ${absoluteTempPath} -> ${absoluteContentsPath}`);

        meta.backups = meta.backups.filter((e) => e.name !== filename);

        return meta;
    });
}

export async function rollbackFile(location: cloud.Location, filename: string): Promise<cloud.Meta> {
    return await modifyMeta(location, async (meta) => {
        const absoluteTempPath = path.resolve(getAbsoluteTempPath(location), filename);
        const absoluteContentsPath = path.resolve(getAbsoluteContentsPath(location), filename);

        logger.info(`Rollback file. ${absoluteTempPath} -> ${absoluteContentsPath}`);

        deleteTempFile(location, filename);

        const fileIndex = meta.items.findIndex((e) => e.name === filename);
        const backupIndex = meta.backups.findIndex((e) => e.name === filename);

        if (backupIndex >= 0) {
            meta.items[fileIndex] = meta.backups[backupIndex];
            meta.backups = meta.backups.filter((e) => e.name !== filename);
        } else {
            meta.items = meta.items.filter((e) => e.name !== filename);
        }

        return meta;
    });
}
