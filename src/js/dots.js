(function (document, window) {
    'use strict';
    /*
    example:
    <span class='dots_trigger' data-id="123" data-state="active" data-dropdown='menu_id'></span>
    <div id='menu_id'>
        <span id='m__edit' data-state='active'>Edit</span>
        <span id='m__delete' data-confirm="Are you sure?" data-link="/api/delete/this/shit">Delete</span>
    </div>

    <script>initDots('.dots_trigger')</script>

    Note: User event (core.emit)  automatically emits on every click. With one argument - id of item.
    If there are data-link, then event emits only after making request (with reponse data).
     */


    window.Dots = function (targetSel, options) {

        let shown = false;
        let target = $(targetSel);
        let trigger;
        let curId;

        let opts = core.extend({}, {
            onShow: noop,
        }, options);

        function onClick(e) {

            let clickTarget = e.target;

            if (!target.contains(clickTarget)) {
                hide();
                return;
            }

            if (clickTarget.tagName === 'SPAN') {

                let id = clickTarget.id,
                    dataLink = data(clickTarget, 'link'),
                    //  dataId = data(clickTarget, 'id'),
                    dataConfirm = data(clickTarget, 'confirm');

                if (dataConfirm) {
                    if (confirm(dataConfirm))
                        process(id, dataLink, curId);
                } else {
                    process(id, dataLink, curId);
                }

                hide();
            }
        }

        function process(id, dataLink, dataId) {
            if (dataLink) {
                core.busy(true);
                core.post(dataLink, {'id': dataId})
                    .then(data => {
                        core.emit(id, [dataId, data])
                    })
                    .catch(err => {
                        core.emit(id, [dataId])
                    })
                    .finally(() => {
                        core.busy(false);
                    });
            } else {
                core.emit(id, [dataId]);
            }
        }

        this.onKeydown = function (event) {
            if (event.code === 'Escape' && shown) hide();
        };

        function toggle(trigger, dataId, dataState) {

            if (shown)
                hide();
            else
                show(trigger, dataId, dataState);
        }

        function show(currentTrigger, dataId, dataState) {
            if (shown)
                return;

            shown = true;

            trigger = currentTrigger;

            listen(document, 'click', onClick);

            target.classList.add('dots-open');

            ariaHidden(target, false);

            position();

            curId = dataId;

            if(dataState) {
                $$('span', target).forEach(item => {
                    // If one of the links have state then compare it with global (trigger) state
                    // and show/hide link. Used for links like "publish/unpublish"
                    // as alternative - property "not-state" for inverse logic
                    let itemState = data(item, 'state');

                    if (itemState) {
                        if (itemState === dataState)
                            window.show(item);
                        else
                            window.hide(item);
                    } else {
                        let itemNotState = data(item, 'not-state');
                        if(itemNotState) {
                            if (itemNotState === dataState)
                                window.hide(item);
                            else
                                window.show(item);
                        }
                    }
                    // Trigger's id we always just sets to all links
                    //item.setAttribute('data-id', dataId);
                });
            }

            opts.onShow.call(this, target, currentTrigger);
        }

        function hide() {
            document.removeEventListener('click', onClick);
            target.classList.remove('dots-open');
            ariaHidden(target, true);
            shown = false;
        }

        function position() {
            let rect = trigger.getBoundingClientRect();

            target.style.left = (rect.left - (target.offsetWidth - trigger.offsetWidth)) + 'px';
            target.style.top = (rect.top + window.pageYOffset + trigger.offsetHeight) + 'px';
        }

        return {
            toggle: toggle
        }
    };

    let dropdowns = {};

    function triggerFunc(el, options) {
        let dataId = data(el, 'id');
        let dataState = data(el, 'state');
        let dataDropdown = data(el, 'dropdown');


        if (dropdowns[dataDropdown] === undefined) {
            dropdowns[dataDropdown] = new Dots(dataDropdown, options);
        }

        dropdowns[dataDropdown].toggle(el, dataId, dataState);
    }

    window.initDots = (selector, options) => {
        $$(selector).forEach(triggerEl => {
            triggerEl.onclick = e => {

                e.preventDefault();
                e.stopPropagation();

                triggerFunc(e.target, options);

                return false;
            };
        });
    }

    /**
     *
     * @param {string} contextSelector
     * @param {string} triggerClass
     */
    window.initDotsGlobal = (contextSelector, triggerClass, options) => {
        $(contextSelector).addEventListener('click', e => {
            if(e.target.classList.contains(triggerClass)) {
                e.preventDefault();
                e.stopPropagation();
                triggerFunc(e.target, options);
            }
        });
    }

})(document, window);
