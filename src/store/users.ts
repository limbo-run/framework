import {db, firestore} from "../vendor/firebase";

const users = db.collection('users');

export interface UserCreate {
    name: string;
    email: string;
    profile?: string;
}

export interface Social {
    id: string;
    key: string;
}
export interface AuthEntry extends Social {
    id: string;
    key: string;
    tokenType: string;
    accessToken: string;
    refreshToken: string;
    scope: string;
    created: number;
    expires: number;
}

export const listUsers = async () => {
    const userList = await users.get();

    return userList.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        }
    })
}

export const normalizeUserDoc = doc => {
    const user = doc.data ? doc.data() : doc;

    return {
        id: doc.id,
        email: user.email,
        role: user.role,
        name: user.name,
        auth: Object.keys(user.auth).map(authEntry => {
            return {
                key: authEntry,
                scope: user.auth[authEntry].scope,
                id: user.auth[authEntry].id,
            }
        })
    }
}

export const findFromService = async (social: Social) => {
    const request = await users.where(`auth.${social.key}.id`, '==', social.id).get();
    if (request.empty) {
        return;
    }

    return normalizeUserDoc(request.docs[0]);
}

export const authToDocument = auth => {
    return {
        id: auth.id,
        key: auth.key,
        accessToken: auth.accessToken,
        expires: firestore.Timestamp.fromDate(new Date(auth.created + auth.expires)),
        scope: auth.scope,
        created: firestore.Timestamp.fromDate(new Date(auth.created)),
        tokenType: auth.tokenType
    }
}

export const identify = async (auth: AuthEntry,  user: UserCreate) => {
    const existingUser = await findFromService(auth);
    if (existingUser) {
        await users.doc(existingUser.id).update({
            ['auth.'+auth.key]: authToDocument(auth)
        });

        return existingUser;
    }

    const record = {
        email: user.email,
        name: user.name,
        profile: user.profile || '',
        role: [],
        auth: {
            [auth.key]: authToDocument(auth)
        }
    };

    const userDoc = await users.add(record);

    return normalizeUserDoc({
        id: userDoc.id,
        ...record
    });
}