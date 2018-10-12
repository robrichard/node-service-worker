const http = require('http');
const {handleWithServiceWorker} = require('./index');

const server = http.createServer(handleWithServiceWorker(event => {
    // event.respondWith('Hello World');
    event.respondWith(fetch(event.request));
    // let url = new URL(event.request.url);
    //
    // if (event.request.headers.has('X-Use-Dev')) {
    //     url.host = "dev." + url.host;
    // }
    //
    // url.protocol = 'https:';
    //
    // event.respondWith(
    //     fetch(url, event.request)
    // )
}, {origin: 'https://www.google.com/'}));

server.listen(7343);

// const {addServiceWorker} = require('./index');


