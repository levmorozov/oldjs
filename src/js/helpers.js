


/**
 * @param {string|HTMLElement} el
 */
function strToEl(el) {
    if (typeof el === 'string')
        el = $(el);
    return el;
}


/**
 * @param {string|HTMLElement} el
 */
window.show = function (el) {
    el = strToEl(el);
    el.style.display = '';
};

/**
 * @param {string|HTMLElement} el
 */
window.hide = function (el) {
    el = strToEl(el);
    el.style.display = 'none';
};


/**
 * @param {string|HTMLElement} el
 * @param {boolean} [forceAction]
 */
window.toggle = function(el, forceAction){
    el = strToEl(el);

    if(forceAction === true || getComputedStyle(el).display === 'none')
        show(el);
    else
        hide(el);
};


/**
 * @param {string} selector
 * @param {HTMLElement} [context]
 */
window.$ = function (selector, context) {
    return (context || document).querySelector(selector);
};

/**
 * @param {HTMLElement|string} el
 * @param {string} type
 * @param {Function} listener
 */
window.on = function(el, type, listener) {
    el = strToEl(el);
    return el.addEventListener(type, listener);
}

/**
 * @param {string} selector
 * @param {HTMLElement} [context]
 */
window.$$ = function (selector, context) {
    let nl = (context || document).querySelectorAll(selector);
    let retval = new Array(nl.length);
    for (let i = nl.length - 1; i >= 0; i--) {
        retval[i] = nl[i];
    }
    return retval;
};

/**
 * @param {HTMLElement|string} el
 * @param {string} name
 */
window.attr = function (el, name) {
    el = strToEl(el);
    return el.getAttribute(name);
}

core.extend = function() {
    let args = arguments;
    for (let i = 1; i < args.length; i++) {
        for (let key in args[i]) {
            args[0][key] = args[i][key]
        }
    }
    return args[0]
}

core.busy = function (on) {
    let cl = document.documentElement.classList;
    let name = 'busy';
    if (on) cl.add('busy'); else cl.remove(name);
}
