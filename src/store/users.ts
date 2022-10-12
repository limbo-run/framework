import {db} from "../vendor/firebase";

const users = db.collection('users');

export interface UserCreate {
    name: string;
    email: string;
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
export const findFromService = async (service: string, id: string) => {
    const request = await users.where('social.discord', '==', id).get();
    if (request.empty) {
        return;
    }

    return {
        ...request.docs[0].data(),
        id: request.docs[0].id
    };
}

export const identify = async (service: string, id: string, user: UserCreate) => {
    const existingUser = await findFromService(service, id);
    if (existingUser) {
        return existingUser;
    }

    const userRef = await users.doc().set({
        email: user.email,
        name: user.name,
        role: [],
        social: {
            [service]: id
        }
    });

    return await findFromService(service, id);
}