/// sort-out-video.js
/// alias sov.js
/// dependency run-at.fn
;(function() {
    const start = () => {
        console.log('SOV');
        const selector = 'sc' + 'ript' + '[type=' + '\'' + 'application/ld+json' + '\'' + ']';
        const sc = document.querySelector(selector);
        
        if (sc) {
            const data = JSON.parse(sc.innerText);
            
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
    
    runAt(( ) => { start(); }, 'interactive');
})();
