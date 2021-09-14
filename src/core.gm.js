(function (core, queue, document, window) {
    'use strict';

    //=include js/promise.polyfill.js
    //=include ../node_modules/unfetch/polyfill/index.js
    //=include js/helpers.js
    //=include js/helpers_ex.js
    //=include js/fetch.js
    //=include js/queue.js
    //=include js/router.js

    function noop() { return true }

    //=include js/dropdown.js
    //=include js/dots.js

    // Temporary fix for backwards compatibility
    window.core = core;

}(window._core = window._core || {},
    window._queue = window._queue || [],
    document, window));
