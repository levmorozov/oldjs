let FOCUSABLE_ELEMENTS = [
    'a[href]',
    'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
    'select:not([disabled]):not([aria-hidden])',
    'textarea:not([disabled]):not([aria-hidden])',
    'button:not([disabled]):not([aria-hidden])',
    'iframe',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])'
], oldFocus;

window.Modal = function (sel, options) {

    let shown = false;
    let opts = extend({}, {
        onShow: noop,
        onHide: noop,
        click: true,
    }, options);

    let modal = strToEl(sel);

    function onKeydown(event) {
        if (event.keyCode === 27 && shown) hide(event);
        if (event.keyCode === 9 && shown) maintainFocus(event);
    }

    function maintainFocus(event) {
        let focusableNodes = $$(FOCUSABLE_ELEMENTS, modal);

        if (!focusableNodes.length)
            return;

        // if focus currently not in the modal
        if (!event || !modal.contains(document.activeElement) && focusableNodes.length) {
            let focused = $('[autofocus]', modal) || focusableNodes[0];
            if (focused)
                focused.focus();
        } else {
            let focusedItemIndex = focusableNodes.indexOf(document.activeElement)

            if (event.shiftKey && focusedItemIndex === 0) {
                focusableNodes[focusableNodes.length - 1].focus()
                event.preventDefault()
            }

            if (!event.shiftKey && focusedItemIndex === focusableNodes.length - 1) {
                focusableNodes[0].focus()
                event.preventDefault()
            }
        }
    }

    function show() {
        if (shown)
            return;

        shown = true;

        document.body.classList.add('w-modal'); // add class to body to disable scrollbars

        // Remember focus:
        oldFocus = document.activeElement

        if (oldFocus.blur) {
            oldFocus.blur();
        }

        ariaHidden(modal, false);

        modal.onclick = function (event) {
            if (event.target.hasAttribute('data-modal-close') ||
                (modal.isEqualNode(event.target) && opts.click)) {
                hide(event);
                event.preventDefault();
            }
        };
        listen(document, 'keydown', onKeydown);

        modal.classList.add('modal__open');

        maintainFocus();

        opts.onShow.call(modal);
    }

    function hide(e) {
        if (!opts.onHide.call(modal, e))
            return;

        ariaHidden(modal, true);

        // Restore focus
        if (oldFocus) oldFocus.focus();

        document.removeEventListener('keydown', onKeydown);

        // Restore scroll
        document.body.classList.remove('w-modal');

        modal.classList.remove('modal__open');
        shown = false;
    }

    return {
        show: show,
        hide: hide
    }
};

