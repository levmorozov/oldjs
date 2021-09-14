window.Router = function (r) {

    let routes = [];

    for (let key in r)
        add(key, r[key]);

    window.addEventListener('popstate', resolve);

    function getUri() {
        return decodeURI(window.location.pathname).replace(/\/+$/, '');//.replace(/^\/+/, '^/');
    }


    function add(re, handler) {
        routes.push({re, handler});
        return this;
    }

    function replaceDynamicURLParts(route) {
        let paramNames = [], regexp;

        if (route instanceof RegExp) {
            regexp = route;
        } else {
            route = route.replace('(', '(?:').replace(')', ')?');
            regexp = new RegExp(
                route.replace(/([:*])(\w+)/g, function (full, dots, name) {
                    paramNames.push(name);
                    return '([^\/]+)';
                }));
        }
        return {regexp, paramNames};
    }

    function regExpResultToParams(match, names) {
        if (names.length === 0) return null;
        if (!match) return null;
        return match
            .slice(1, match.length)
            .reduce((params, value, index) => {
                if (params === null) params = {};
                params[names[index]] = decodeURIComponent(value);
                return params;
            }, null);
    }


    function resolve() {
        let uri = getUri();

        for (let i in routes) {
            let route = replaceDynamicURLParts(routes[i].re);
            let match = uri.match(route.regexp);

            if (match) {
                match.shift();
                routes[i].handler.apply({}, match);
                return this;
            }
        }
    }

    function push(path) {
        window.history.pushState({}, '', path);
        resolve();
        return true;
    }

    return {
        resolve: resolve,
        push: push
    }
}

