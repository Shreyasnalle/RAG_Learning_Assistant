(function () {
    function isWatchPage() {
        return window.location.pathname === "/watch" && window.location.search.includes("v=");
    }
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.fetch = async function (...args) {
        const response = await originalFetch(...args);
        if (!isWatchPage()) return response;
        const url = args[0] ? args[0].toString().toLowerCase() : "";
        if (
            url.includes("timedtext") ||
            url.includes(".vtt") ||
            url.includes(".srt") ||
            url.includes("subtitle") ||
            url.includes("caption") ||
            url.includes("/tracks")
        ) {
            try {
                const clonedResponse = response.clone();
                const rawText = await clonedResponse.text();
                const trackUrlStr = args[0] ? args[0].toString() : "";
                const videoIdMatch = trackUrlStr.match(/[?&]v=([^&]+)/);
                const videoUrl = videoIdMatch
                    ? `https://www.youtube.com/watch?v=${videoIdMatch[1]}`
                    : window.location.href;
                const currentVideoId = new URLSearchParams(window.location.search).get("v");
                const captionVideoId = videoIdMatch ? videoIdMatch[1] : null;
                if (captionVideoId && currentVideoId && captionVideoId !== currentVideoId) {
                    return response;
                }
                window.dispatchEvent(
                    new CustomEvent(
                        "captions intercepted",
                        {
                            detail: {
                                sourceurl: videoUrl,
                                trackurl: args[0],
                                body: rawText
                            }
                        }
                    )
                );
            }
            catch (err) {
                
            }
        }
        return response;
    };
    window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.addEventListener("load", function () {
            if (!isWatchPage()) return;
            const lowerUrl = url ? url.toString().toLowerCase() : "";
            if (
                lowerUrl.includes("timedtext") ||
                lowerUrl.includes(".vtt") ||
                lowerUrl.includes(".srt") ||
                lowerUrl.includes("subtitle") ||
                lowerUrl.includes("caption") ||
                lowerUrl.includes("/tracks")
            ) {
                try {
                    const rawText = this.responseText;
                    const trackUrlStr = url ? url.toString() : "";
                    const videoIdMatch = trackUrlStr.match(/[?&]v=([^&]+)/);
                    const videoUrl = videoIdMatch
                        ? `https://www.youtube.com/watch?v=${videoIdMatch[1]}`
                        : window.location.href;

                    const currentVideoId = new URLSearchParams(window.location.search).get("v");
                    const captionVideoId = videoIdMatch ? videoIdMatch[1] : null;
                    if (captionVideoId && currentVideoId && captionVideoId !== currentVideoId) {
                        return;
                    }
                    window.dispatchEvent(
                        new CustomEvent(
                            "captions intercepted",
                            {
                                detail: {
                                    sourceurl: videoUrl,
                                    trackurl: url,
                                    body: rawText
                                }
                            }
                        )
                    );
                }
                catch (err) {
                    
                }
            }
        });
        return originalXHR.apply(this, [method, url, ...rest]);
    };
})();