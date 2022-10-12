import axios from "axios";

import {error} from "../";

export const client = iam => {
    return {
        async query(path: string, params = {
            method: 'GET',
            data: {},
            baseURL: `https://discord.com/api`
        }) {
            const {
                method = 'GET',
                data = {},
                baseURL = `https://discord.com/api`
            } = params;

            try {
                const R = await axios(
                    {
                        url: `${baseURL}/${path}`,
                        method: method,
                        data: method === 'GET' ? undefined : data,
                        headers: {
                            authorization: `${iam.token_type} ${iam.access_token}`,
                        },
                    }
                );

                return R.data;
            } catch(e) {
                error(e);

                throw e;
            }

        }
    }
}