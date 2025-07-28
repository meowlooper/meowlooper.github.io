/// sort-out-video.js
/// alias sov.js
/// world ISOLATED
/// dependency run-at.fn
function sortOutVideo() {
    const sc = document.querySelector('script[type="application/ld+json"]');
    
    if (sc) {
        const data = JSON.parse(sc.innerText);
        
        const v = document.querySelector('video');
        if (v) {
            v.src = data.contentUrl;
            v.setAttribute('controls', undefined);
            
            while (v.nextSibling) {
                v.nextSibling.remove();
            }
        }
    }
}
