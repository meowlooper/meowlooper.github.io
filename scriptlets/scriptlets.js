/// sort-out-video.js
/// alias sov.js
/// dependency run-at.fn
; (function () {
    const start = () => {
        console.log('SOV');
        const selector = 'sc' + 'ript' + '[type=' + '\'' + 'application/ld+json' + '\'' + ']';
        const elem = document.querySelector(selector);
        if (elem) {
            const data = JSON.parse(elem.innerText);
            const v = document.querySelector('video');
            if (v) {
                v.src = data.contentUrl;
                v.controls = true;
                while (v.nextSibling) {
                    v.nextSibling.remove();
                }
            }
        }
    };
    runAt(() => { start(); }, 'interactive');
})();
