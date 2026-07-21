(function () {
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.fetch = async function (...args) {
        const response = await originalFetch(...args);
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
                )
            }
            catch (err) {
                
            }
        }
        return response;
    }
    window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.addEventListener("load", function () {
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
                    )
                }
                catch (err) {

                }
            }
        })
        return originalXHR.apply(this, [method, url, ...rest]);
    }
})();