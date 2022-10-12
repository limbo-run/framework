process.env.SERVICE_ID = "test";

const limbo = require("../lib");


const task = async () => {
    const auth = {
        id: 'xxx_yyy',
        key: 'discord',
        tokenType: 'Dummy',
        accessToken: 'access_token_xxx',
        refreshToken: 'refresh_token_xxx',
        scope: 'scope0 scope1',
        created: Date.now(),
        expires: 5000
    };
    const user = {
        name: 'test_name',
        email: 'test_email'
    };

    const identity = await limbo.users.identify(auth, user);

    console.log(identity);
};

task().catch(console.error);