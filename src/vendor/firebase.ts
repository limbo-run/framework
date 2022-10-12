import {readFileSync} from "fs";
import {join} from "path";

import admin from 'firebase-admin';

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

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

export {
    db
}