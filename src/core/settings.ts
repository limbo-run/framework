
import {db} from "../vendor/firebase";
import {debug} from "./index";

const store = {
    data: {},
    get(key, defaultValue) {
        return process.env[key] || store.data[key] || defaultValue;
    },
    set(key, value) {
        store.data[key] = value;
    }
}

export async function loadSettings() {
    const entries = await db.collection('config').get();

    const entriesTemp = {};

    entries.docs.forEach(document => {
        const key = document.id;
        const entry = document.data();

        entriesTemp[key] = entry.value;
    });

    function resolve(value) {
        const reg = new RegExp("\\${.*?\\}","g");
        const matches = value.match(reg);
        if (!matches) {
            return value;
        }

        matches.forEach(match => {
            const lookup = match.substring(2, match.length-1);
            const lookupValue = process.env[lookup] || entriesTemp[lookup];

            if (typeof lookupValue === 'undefined') {
                throw `No config found for ${lookup}, set in ENV or in DB`
            }

            const resolvedLookupValue = resolve(lookupValue);

            value = value.replace(match, resolvedLookupValue);
        })

        return value;
    }

    for(let key in entriesTemp) {
        const value = resolve(entriesTemp[key]);

        store.set(key, value);

        debug("loaded setting ", key);
    }
}

export function setting(key: string, defaultValue?: any) {
    return store.get(key, defaultValue);
}

