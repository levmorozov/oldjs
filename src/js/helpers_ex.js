
core.strToEl = strToEl;
core.extend = extend;

window.attr = attr;

/**
 * @param {boolean} on
 */
core.busy = function (on) {
    let cl = document.body.classList;
    let name = 'busy';
    if (on) cl.add('busy'); else cl.remove(name);
}

let events = {};

/**
 * @param {string} event
 * @param {Function} callback
 */
core.on = function(event, callback) {
    if(events[event] === undefined)
        events[event] = [];
    events[event].push(callback);
};

/**
 * @param {string} event
 * @param {[]} args
 */
core.emit = function(event, args) {
    if(events[event] === undefined)
        return;

    events[event].forEach( callback => {
        callback.apply(null, args);
    });
};
