window.Dropdown = function (selector, options) {

    let shown = false;

    let opts = core.extend({
        onShow: noop,
        onHide: noop,
        onClick: noop
    }, options);

    let trigger = strToEl(selector);
    let target = $(data(trigger, 'dropdown'));

    listen(trigger, 'click', event => {
        event.preventDefault();
        event.stopPropagation();

        if (shown)
            hide();
        else
            show();
    });

    function onClick(e) {
        if (!opts.onClick.call(target, e) || !target.contains(e.target) || e.target.tagName === 'A') hide();
    }

    this.onKeydown = event => {
        if (event.keyCode === 27 && shown) hide(event);
    };

    function show(event) {

        if (shown)
            return;

        if (trigger.classList.contains('dropdown-disabled')) return;

        listen(document, 'click', onClick);

        target.classList.add('dropdown-open');
        ariaHidden(target, false);

        position();

        shown = true;
        opts.onShow.call(target);
    }

    function hide(e) {
        if (!opts.onHide.call(target, e))
            return;

        document.removeEventListener('click', onClick);

        target.classList.remove('dropdown-open');
        ariaHidden(target, true);
        shown = false;

        opts.onHide.call(target, e);
    }

    function position() {
        let hOffset = trigger ? parseInt(data(trigger, 'x-offset') || 0, 10) : null,
            vOffset = trigger ? parseInt(data(trigger, 'y-offset') || 0, 10) : null;

        if (!target || !trigger) return;

        let styles = getComputedStyle(trigger);
        let anchorRightMode = target.classList.contains('dropdown-anchor-right');

        // Position the i_dropdown relative-to-parent...
        if (target.classList.contains('dropdown-relative')) {

            target.style.left = (anchorRightMode ?
                trigger.offsetLeft - (target.offsetWidth - trigger.offsetWidth) - parseInt(styles['margin-right'], 10) + hOffset :
                trigger.offsetLeft + parseInt(styles['margin-left'], 10) + hOffset) + "px";

            target.style.top = (trigger.offsetTop + trigger.offsetHeight - parseInt(styles['margin-top'], 10) + vOffset) + "px";
        } else {
            // ...or relative to document
            let rect = trigger.getBoundingClientRect();

            target.style.left = anchorRightMode
                ? (rect.left - (target.offsetWidth - trigger.offsetWidth) + hOffset) + 'px'
                : (rect.left + hOffset) + "px";

            target.style.top = (rect.top + window.pageYOffset + trigger.offsetHeight + vOffset) + 'px';
        }
    }

    return {
        show: show,
        hide: hide,
        opts: opts
    }
};
