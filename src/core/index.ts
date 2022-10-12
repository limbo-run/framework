import {loadSettings as settings} from "./settings";
import {debug, error} from "./logger";

export * from './helpers';
export * from './server';
export * from './settings';
export * from './logger';
export * from './middleware/authorized'

export const LoadLock = new Promise((resolve, reject) => {
    Promise
        .all([
            settings(),
        ])
        .then(() => {
            debug("server ready");

            resolve(null);
        })
        .catch(err => {
            error("could not start application", err)

            process.exit(1);

            reject(error);
        });
});