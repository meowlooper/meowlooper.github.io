/// sort-out-video.js
/// alias sov.js
/// dependency run-at.fn
; (function () {
    let counter = 0;
    const w = window;
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
        const vids = document.querySelectorAll('video');
        for (let v of vids) {
            console.log('v: ' + v.style.filter);
            v.classList.remove('sfw-censored');
            v.style.setProperty('filter', 'none', 'important');
        }
        if (++counter < 5) {
            w.setTimeout(() => { deblur(); }, 2000);
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
    };
    runAt(() => { start(); }, 'interactive');
})();
