const fetch = require('node-fetch');
const {URL} = require('url');
const {Headers, Request, Response} = fetch;

// polyfill globals
global.fetch = (url, options) => fetch(url, {...options, compress: false}); // don't auto gunzip
global.URL = URL;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

function handleError(res, e) {
    res.statusCode = 503;
    res.end(e.stack);
}

function handleWithServiceWorker(serviceWorkerHandler, {origin}) {
    return async function handler(req, res) {
        const url = new URL(`${origin}${req.url}`);
        const headers = new Headers(req.headers);
        // overwrite Host header
        headers.set('Host', url.host);
        const request = new Request(
            url,
            {
                compress: false,
                method: req.method,
                headers,
            }
        );


        try {
            await serviceWorkerHandler({
                request,
                async respondWith(data) {
                    if (typeof data === 'string') {
                        res.end(data);
                        return;
                    }
                    try {
                        const respondWithResponse = await data;
                        res.statusCode = respondWithResponse.status;
                        res.statusMessage = respondWithResponse.statusText;
                        for (const [key, val] of respondWithResponse.headers) {
                            res.setHeader(key, val);
                        }
                        respondWithResponse.body.pipe(res);
                    } catch (e) {
                        handleError(res, e)
                    }
                }
            })
        } catch (e) {
            handleError(res, e)
        }
    }
}

module.exports = {handleWithServiceWorker};
