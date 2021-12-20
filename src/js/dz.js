window.Dz = function (sel, options) {

    let opts = core.extend({}, {
        onFile: noop,
    }, options);
    let dz = core.strToEl(sel);
    let input = $(dz.dataset.input || 'input[type=file]');
    let multipleMode = !!input.multiple;
    let dzText = $('.dz__text', dz);

    let defaultText = dzText.innerText;

    document.addEventListener('drop', e => e.preventDefault());
    document.addEventListener('dragover', e => e.preventDefault());

    if (!window.FileReader) {
        dzText.innerText = dz.dataset.supportTxt;
        input.disabled = true;
        return;
    }

    dz.addEventListener('dragover', () => dz.classList.add('dropzone-hover'));
    dz.addEventListener('dragleave', () => dz.classList.remove('dropzone-hover'));
    dz.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.remove('dropzone-hover');
        upload(e.dataTransfer.files);
    });
    dz.addEventListener('click', () => input.click());

    input.addEventListener('change', e => {
        e.preventDefault();
        upload(input.files);
    });

    function upload(files) {
        core.busy(true);
        for (let i = 0; i < files.length; i++) {
            let file = files.item(i);
            dzText.innerText = file.name;
            opts.onFile.call(dz, file)
                .finally(() => {
                    core.busy(false);
                    dzText.innerText = defaultText;
                    input.value = '';
                });
        }
    }

    return {}
};