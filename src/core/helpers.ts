export const query = (queryParams) => {
    return Object.entries(queryParams).reduce((params, [key, value]) => {
        if (value !== null)
            params.append(key, `${value}`)
        return params;
    }, new URLSearchParams());
};

export const encode = (url, queryParams) => {
    const queryString = query(queryParams);

    return (`${url}${query ? '?' : ''}${queryString}`);
};

export const utf_to_b64 = (str) => btoa(unescape(encodeURIComponent(str)));
export const b64_to_utf = (str) => decodeURIComponent(escape(atob(str)));