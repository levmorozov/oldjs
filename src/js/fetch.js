

window.serializeArray = function (form) {
    let serialized = [];
    for (let i = 0; i < form.elements.length; i++) {
        let field = form.elements[i];
        if (field.name && !field.disabled && ['file', 'reset', 'submit', 'button'].indexOf(field.type) === -1) {
            if (field.type === 'select-multiple') {
                for (let j = 0; j < field.options.length; j++) {
                    if (field.options[j].selected) {
                        serialized.push({
                            name: field.name,
                            value: field.options[j].value
                        });
                    }
                }
            } else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
                serialized.push({
                    name: field.name,
                    value: field.value
                });
            }
        }
    }
    return serialized;
};

function encodeUriParams(data) {
    return Object.keys(data).map(function (key) {
        if (Array.isArray(data[key]))
            return data[key].map(function (value) {
                return encodeURIComponent(key) + '[]=' + encodeURIComponent(value);
            }).join('&');
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    }).join('&');
}

function parseUrl(url) {
    let vars = {};
    url = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = decodeURIComponent(value);
        return '';
    });
    return [url, vars];
}

function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
}


/**
 * Thin wrapper around fetch.
 * For string - uses it as serializes json and sets request type as application/json
 * For forms - makes FormData
 * Anything else: encode as  x-www-form-urlencoded.
 *
 * (Serialization is one-level and without array support)
 *
 * @param {string} method
 * @param {string} url
 * @param {Array|Object} data
 * @returns {Promise<Response>}
 */
core.fetchQuery = function (method, url, data) {

    let headers = {
        'X-Requested-With': 'XMLHttpRequest'
    };
    let contentType;

    if (data) {
        if (typeof data === 'string') {
            contentType = 'application/json';
        } else if (isElement(data)) {
            data = new FormData(data);
        } else if (!(data instanceof FormData)) {
            contentType = 'application/x-www-form-urlencoded';
            data = encodeUriParams(data);
        }
    }
    if (contentType) {
        headers['Content-Type'] = contentType + '; charset=utf-8'
    }

    return fetch(url, {
        credentials: 'same-origin',
        method: method,
        headers: headers,
        body: data
    }).then(function (response) {
        let contentType = response.headers.get('content-type');

        // if json
        if (!contentType || contentType.indexOf('json') !== -1) {
            return response.json().then(function (json) {
                if (response.ok)
                    return json;
                return Promise.reject(core.extend({}, json, {
                    status: response.status,
                    statusText: response.text
                }));
            })
        } else {
            return response.text().then(function (text) {
                if (response.ok)
                    return text;
                return Promise.reject({
                    status: response.status,
                    statusText: response.statusText,
                    err: text
                })
            })
        }
    });
};

/**
 * Make post-request
 *
 * Preprocess request body - see in fetchQuery
 *
 * If response content-type "application/json" then response will be decoded
 *
 * @param {string} url
 * @param {object} [data]
 * @returns {Promise<Response>}
 */
core.post = function (url, data) {
    return core.fetchQuery('post', url, data);
};


/**
 * Make get-request
 *
 * All params in data will be merged with query-params (if any)
 * (Url parsed with simple regexp and merge is pretty simple, no support for nested objects, etc)
 *
 * @param {string} url
 * @param {object} [data]
 * @returns {Promise<Response>}
 */
core.get = function (url, data) {
    if (data) {
        let parsedUrl = parseUrl(url);
        let params = core.extend({}, parsedUrl[1], data);
        url = parsedUrl[0] + '?' + encodeUriParams(params);
    }
    return core.fetchQuery('get', url);
};
