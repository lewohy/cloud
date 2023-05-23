import { Mutex } from 'async-mutex';
import fs from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import config from '~/config.json';
import { getPathString } from './core';
import logger from './logger';

const mutex = new Mutex();
const absoluteSharePath = path.resolve(process.cwd(), config.path.preference.name, config.path.preference.share.name);

export function getShare(): cloud.Share {

    if (!fs.existsSync(absoluteSharePath)) {
        logger.error(`Share file not found: ${absoluteSharePath}`);
        throw new Error(`Cannot Not found share.json.`);
    }

    return JSON.parse(fs.readFileSync(absoluteSharePath, 'utf-8'));
};

export function modifyShare(callback: (share: cloud.Share) => Promise<cloud.Share>): Promise<cloud.Share> {
    return new Promise(async (resolve, reject) => {
        const release = await mutex.acquire();
        logger.info(`lock mutex for while modifying share.json`);
        try {
            const share = getShare();
            const newShare = await callback(share);
            fs.writeFileSync(absoluteSharePath, JSON.stringify(newShare, null, 4));
            
            resolve(newShare);
        } catch (e) {
            reject(e);
        } finally {
            release();
            logger.info(`unlock mutex for while modifying share.json`);
        }
    });
};

export async function createShareId(location: cloud.Location): Promise<string> {
    const shareId = nanoid();
    
    await modifyShare(async (share) => {
        share[shareId] = {
            location
        };

        return share;
    });

    return shareId;
}

export async function getShareIdByLocation(location: cloud.Location): Promise<string | null> {
    const share = getShare();
    
    const idList = Object.keys(share);
    
    for (let i = 0; i < idList.length; i++) {
        const id = idList[i];
        const shareItem = share[id];
        if (getPathString(shareItem.location) === getPathString(location)) {
            return id;
        }
    }

    return null;
}

export function getLocationByShareId(shareId: string): cloud.Location | null {
    const share = getShare();
    const shareItem = share[shareId];
    if (shareItem) {
        return shareItem?.location;
    }
    return null;
}