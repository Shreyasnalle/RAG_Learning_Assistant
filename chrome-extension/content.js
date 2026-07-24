function isWatchPage() {
    return window.location.pathname === "/watch" && window.location.search.includes("v=");
}

// Relay captions intercepted by inject.js (MAIN world) to background.js
window.addEventListener("captions intercepted", (event) => {
    if (!isWatchPage()) return;
    chrome.runtime.sendMessage({
        videourl: event.detail.sourceurl,
        trackurl: event.detail.trackurl,
        rawtext: event.detail.body
    });
});