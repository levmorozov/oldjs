(function (document, window) {

    'use strict';


    window.show = function (el) {
        if (typeof el === 'string')
            el = $(el);
        el.style.display = '';
    };

    window.hide = function (el) {
        if (typeof el === 'string')
            el = $(el);
        el.style.display = 'none';
    };

    window.toggle = function (el) {
        if (typeof el === 'string')
            el = $(el);
        if (window.getComputedStyle(el).display === 'none')
            show(el);
        else
            hide(el);
    };

    window.$ = function (selector, context) {
        return (context || document).querySelector(selector);
    };

    window.$$ = function (selector, context) {
        let nl = (context || document).querySelectorAll(selector);
        let retval = new Array(nl.length);
        for (let i = nl.length - 1; i >= 0; i--) {
            retval[i] = nl[i];
        }
        return retval;
    };

    window.attr = function (el, name) {
        return el.getAttribute(name);
    }


}(document, window));
