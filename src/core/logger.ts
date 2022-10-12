const LOG_LEVEL = process.env.LOG_LEVEL || "debug";

const { color } = require('console-log-colors');
const { red, green, cyan } = color;

export const Level = {
    INFO: {
        label: "info",
        predicate: () => LOG_LEVEL !== "none",
        theme: cyan
    },
    ERROR: {
        label: "error",
        predicate: () => LOG_LEVEL !== "none",
        theme: red
    },
    DEBUG: {
        label: "debug",
        predicate: () => LOG_LEVEL.includes("debug"),
        theme: green
    },
};

export const log = (level, ...message) => {
    if (!level.predicate()) {
        return;
    }

    console.log(`[${level.theme(level.label)}]: `, ...message);
}

export const error = (...message) => log(Level.INFO, ...message);
export const print = (...message) => log(Level.ERROR, ...message);
export const debug = (...message) => log(Level.DEBUG, ...message);
