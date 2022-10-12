const micro = require("micro");

const limbo = require("../lib");
const {router, get} = require("microrouter");

process.env.SERVICE_ID = 'test';

const handler = async(context) => {
    context.request.session.counter = context.request.session.counter || 0;
    context.request.session.counter = context.request.session.counter + 1;

    return context.request.session.counter;
}

const routes = router( get('/', limbo.handler(handler)));
micro(routes).listen(process.env.PORT || 3000);