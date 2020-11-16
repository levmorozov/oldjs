(function (document) {
    'use strict';

    function noop() { return true }
    function ariaHidden(el, flag) {
        setAttr(el, 'aria-hidden', el);
    }

    //=include js/modal.js

}(document));
