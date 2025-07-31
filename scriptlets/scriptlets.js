/// sort-out-video.js
/// alias sov.js
/// dependency run-at.fn
; (function () {
    const deblur = () => {
        const items = document.querySelectorAll('.thumb-block');
        for (let item of items) {
            const image = item.querySelector('.thumb a img');
            if (image) {
                image.removeAttribute('style');
            }
            const blur = item.querySelector('.sfw-click-area');
            if (blur) {
                blur.remove();
            }
        }        
    };
    const start = () => {
        console.log('SOV');
        const selector = 'sc' + 'ript' + '[type=' + '\'' + 'application/ld+json' + '\'' + ']';
        const elem = document.querySelector(selector);
        if (elem) {
            const data = JSON.parse(elem.innerText);
            const v = document.querySelector('video');
            if (v && !v.src) {
                v.src = data.contentUrl;
                v.controls = true;
                while (v.nextSibling) {
                    v.nextSibling.remove();
                }
            }
        }
        deblur();
        window.setTimeout(() => { deblur(); }, 2000);
    };
    runAt(() => { start(); }, 'interactive');
})();
