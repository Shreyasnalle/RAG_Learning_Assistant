window.addEventListener(
    "captions intercepted", 
    (event) => {
        chrome.runtime.sendMessage({
            videourl : event.detail.sourceurl,
            trackurl : event.detail.trackurl,
            rawtext : event.detail.body
        })
    }
)