
let loaded = false,
    counter = 1000;

function onDomReady(e) {
    if (loaded)
        return;

    loaded = true;

    execute();
}

if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', onDomReady);
else
    onDomReady();

queue.push = function (el) {
    Array.prototype.push.call(queue, el);

    if (loaded)
        execute();
};

function execute() {
    if (!queue.length)
        return;

    queue.sort(function (a, b) {
        return a[1] - b[1];
    });

    while (queue.length) {
        let el = queue.shift();
        el.call(document);
    }
}

