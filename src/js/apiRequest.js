/**
* Basic wrapper method for api calls to a nextcloud instance.
*
* @param {string} endpoint Full URL
* @param {string} method GET|POST
* @param {mixed} data Payload
* @param {string} username
* @param {string} password
* @returns {Promise}
*/
function apiRequest(endpoint, method, data, username, password) {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
    headers.append('Accept', 'application/json, text/plain, */*');
    const opts = { method, headers, credentials: 'omit' };

    if (method.toLowerCase() !== 'get') {
        headers.append('Content-Type','application/json;charset=UTF-8');
        opts.body = JSON.stringify(data);
    }

    const request = new Request(endpoint, opts);

    return new Promise((resolve, reject) => {
        fetch(request).then(response => {
            if (response.status !== 200) {
                reject(response);
                return;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                response.json().then(json => {
                    if (!json) {
                        reject({ statusText: 'Empty reply from server', status: 0 });
                        return;
                    }

                    resolve(json);
                });
            } else {
                reject({ statusText: 'Invalid reply from server', status: 0 });
            }
        }).catch(function (e) {
            reject({ statusText: e, status: 0 });
        });
    });
}