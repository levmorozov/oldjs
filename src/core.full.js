(function (core, queue, document, window) {
    'use strict';

    //=include js/promise.polyfill.js
    //=include ../node_modules/unfetch/polyfill/index.js
    //=include js/helpers.js
    //=include js/fetch.js
    //=include js/queue.js

    function noop() { return true }

    //=include js/modal.js
    //=include js/dropdown.js
    //=include js/dots.js

}(window.core = window.core || {},
    window._queue = window._queue || [],
    document, window));
