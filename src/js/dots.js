(function (document) {
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


    window.Dots = function (targetSel) {

        let shown = false;
        let target = $(targetSel);
        let trigger;
        let curId;

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
                core.post(dataLink + dataId)
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
            if (event.keyCode === 27 && shown) hide();
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


            $$('span', target).forEach(item => {
                // If one of the links have state then compare it with global (trigger) state
                // and show/hide link. Used for links like "publish/unpublish"
                let itemState = data(item, 'state');
                if (itemState) {
                    if (itemState === dataState)
                        window.show(item);
                    else
                        window.hide(item);
                }
                // Trigger's id we always just sets to all links
                //item.setAttribute('data-id', dataId);

            });
        }

        function hide() {
            document.removeEventListener('click', onClick);
            target.classList.remove('dots-open');
            ariaHidden(target, true);
            shown = false;
        }

        function position() {
            let rect = trigger.getBoundingClientRect();

            target.style.left = (trigger.offsetLeft - (target.offsetWidth - trigger.offsetWidth)) + 'px';
            target.style.top = (rect.top + document.body.scrollTop + trigger.offsetHeight) + 'px';
        }

        return {
            toggle: toggle
        }
    };

    let dropdowns = {};

    window.initDots = function (selector) {
        $$(selector).forEach(triggerEl => {

            triggerEl.onclick = function (e) {

                e.preventDefault();
                e.stopPropagation();

                let dataId = data(this, 'id');
                let dataState = data(this, 'state');
                let dataDropdown = data(this, 'dropdown');


                if (dropdowns[dataDropdown] === undefined) {
                    dropdowns[dataDropdown] = new Dots(dataDropdown);
                }

                dropdowns[dataDropdown].toggle(this, dataId, dataState);

                return false;
            };

        });
    }

})(document);
