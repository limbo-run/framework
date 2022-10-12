import {readFileSync} from "fs";
import {join} from "path";

import admin from 'firebase-admin';

import {b64_to_utf} from "../core/helpers";

let serviceAccount;

if (process.env.FIREBASE_AUTH) {
    const json = b64_to_utf(process.env.FIREBASE_AUTH);

    serviceAccount = JSON.parse(json);
} else {
    const serviceAccountFileLocation = process.env.FIREBASE_SERVICE_ACCOUNT_FILE ||
        join(`${process.env.ROOT_DIRECTORY}`, "..", "limbo.json");

    serviceAccount = JSON.parse(readFileSync(
        serviceAccountFileLocation,
        "utf-8"
    ));
}

const app = admin.apps.length !== 0 ? admin.apps[0] : admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
}, "limbo");

const db = app.firestore();
const firestore = admin.firestore;
export {
    db,
    firestore
}